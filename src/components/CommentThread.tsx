
import React, { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThumbsUp, CornerDownRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type CommentDB = {
  id: string;
  question_id: number;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
};

type Like = {
  id: string;
  user_id: string;
  comment_id: string;
};

type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

const fetchComments = async (questionId: number): Promise<CommentDB[]> => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("question_id", questionId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
};

const fetchLikes = async (): Promise<Like[]> => {
  const { data, error } = await supabase.from("likes").select("*");
  if (error) return [];
  return data;
};

const fetchProfiles = async (userIds: string[]): Promise<Profile[]> => {
  if (userIds.length === 0) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id,username,avatar_url")
    .in("id", userIds);
  if (error) return [];
  return data as Profile[];
};

const CommentThread = ({ questionId }: { questionId: number }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Top-level comments and thread
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", questionId],
    queryFn: () => fetchComments(questionId),
  });

  // Likes for current page
  const { data: likes = [] } = useQuery({
    queryKey: ["likes", questionId],
    queryFn: fetchLikes,
  });

  // For all users who commented
  const userIds = useMemo(
    () => Array.from(new Set(comments.map((c) => c.user_id))),
    [comments]
  );
  const { data: profiles = [] } = useQuery({
    queryKey: ["commenters", userIds.join("-")],
    queryFn: () => fetchProfiles(userIds),
    enabled: userIds.length > 0,
  });

  // Index for fast lookup
  const profileMap = useMemo(() => {
    const map: Record<string, Profile> = {};
    profiles.forEach((p) => (map[p.id] = p));
    return map;
  }, [profiles]);

  // Nested comments, thread structure
  const buildThread = (parentId: string | null): CommentDB[] =>
    comments.filter((c) => c.parent_id === parentId);

  // Like handlers
  const likeMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("Harus login");
      // Is liked?
      const existing = likes.find(
        (l) => l.comment_id === commentId && l.user_id === user.id
      );
      if (existing) {
        await supabase
          .from("likes")
          .delete()
          .eq("id", existing.id);
      } else {
        await supabase.from("likes").insert({
          user_id: user.id,
          comment_id: commentId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likes", questionId] });
    },
  });

  // Add comment/reply
  const addCommentMutation = useMutation({
    mutationFn: async (input: { content: string; parentId: string | null }) => {
      if (!user) throw new Error("Harus login");
      await supabase.from("comments").insert({
        content: input.content,
        user_id: user.id,
        question_id: questionId,
        parent_id: input.parentId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", questionId] });
      setReplying({});
      setReplyText("");
      setNewComment("");
    },
  });

  const [replying, setReplying] = useState<{ [cid: string]: boolean }>({});
  const [replyText, setReplyText] = useState<string>("");
  const [newComment, setNewComment] = useState<string>("");

  // Like UI helper
  const isLikedByMe = (commentId: string) =>
    !!user && likes.some((l) => l.comment_id === commentId && l.user_id === user.id);

  // Like count
  const likeCount = (commentId: string) =>
    likes.filter((l) => l.comment_id === commentId).length;

  // Post new top-level comment
  const handleNewComment = () => {
    if (!user) return alert("Harus login untuk komentar!");
    if (!newComment.trim()) return;
    addCommentMutation.mutate({ content: newComment, parentId: null });
  };

  function CommentNode({ comment }: { comment: CommentDB }) {
    const commenter = profileMap[comment.user_id];
    const children = buildThread(comment.id);
    return (
      <div className="mb-4 pl-1 border-l-2 border-[#efd8a1]">
        <div className="flex items-start gap-2">
          {commenter?.avatar_url ? (
            <img
              src={commenter.avatar_url}
              alt="avatar"
              className="w-7 h-7 rounded-full border bg-white"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#f4e1b8] flex items-center justify-center font-bold text-[#b88134]">
              {commenter?.username?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}

          <div className="flex-1">
            <div className="text-xs font-semibold text-[#865622] flex items-center gap-2">
              @{commenter?.username || "user"}
              <span className="text-[10px] font-normal text-[#c09a57] ml-2">
                {new Date(comment.created_at).toLocaleString("id-ID", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <div className="mt-1 text-sm text-[#3b2509]">{comment.content}</div>
            <div className="flex items-center gap-2 mt-1">
              <Button
                size="sm"
                variant={isLikedByMe(comment.id) ? "default" : "outline"}
                className={isLikedByMe(comment.id)
                  ? "bg-[#b88134] text-white border-[#b88134]"
                  : "border-[#b88134] text-[#b88134] hover:bg-[#f4e1b8]"
                }
                onClick={() => likeMutation.mutate(comment.id)}
              >
                <ThumbsUp size={15} className="mr-1" />
                {likeCount(comment.id)}
              </Button>
              {user && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-[#865622] px-2 underline"
                  onClick={() =>
                    setReplying((v) => ({
                      ...v,
                      [comment.id]: !v[comment.id],
                    }))
                  }
                >
                  <CornerDownRight className="mr-1" size={13} />
                  Balas
                </Button>
              )}
            </div>
            {replying[comment.id] && (
              <div className="mt-2">
                <Textarea
                  value={replyText}
                  className="mb-1"
                  rows={2}
                  placeholder="Tulis balasan..."
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <Button
                  size="sm"
                  className="bg-[#b88134] text-white"
                  disabled={addCommentMutation.isPending}
                  onClick={() => {
                    addCommentMutation.mutate({
                      content: replyText,
                      parentId: comment.id,
                    });
                  }}
                >
                  Kirim
                </Button>
              </div>
            )}
          </div>
        </div>
        {/* Recursively render children */}
        <div className="pl-4 mt-1">
          {children.map((child) => (
            <CommentNode key={child.id} comment={child} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h4 className="font-bold mb-2 text-[#8d581d]">Diskusi &amp; Komentar</h4>
      {isLoading ? (
        <div className="p-8 text-center text-gray-400">Memuat komentar...</div>
      ) : (
        <>
          {/* New top-level comment */}
          <div className="mb-6">
            {user ? (
              <div>
                <Textarea
                  value={newComment}
                  className="mb-1"
                  rows={3}
                  placeholder="Tambahkan komentar..."
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  className="bg-[#b88134] text-white mt-1"
                  disabled={addCommentMutation.isPending}
                  onClick={handleNewComment}
                >
                  Kirim Komentar
                </Button>
              </div>
            ) : (
              <div className="text-xs text-[#b88134] mb-3">
                <span>
                  <a
                    href="/auth"
                    className="underline text-[#a76d32] hover:text-[#b88134]"
                  >
                    Masuk
                  </a>{" "}
                  untuk mengomentari atau membalas.
                </span>
              </div>
            )}
          </div>
          {/* Show thread */}
          <div>
            {buildThread(null).map((comment) => (
              <CommentNode key={comment.id} comment={comment} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CommentThread;
