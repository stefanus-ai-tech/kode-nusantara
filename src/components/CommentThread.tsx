import React, { useState, useMemo, useCallback } from 'react'; // Import useCallback
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ThumbsUp, CornerDownRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

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
    .from('comments')
    .select('*')
    .eq('question_id', questionId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

const fetchLikes = async (): Promise<Like[]> => {
  const { data, error } = await supabase.from('likes').select('*');
  if (error) return [];
  return data;
};

const fetchProfiles = async (userIds: string[]): Promise<Profile[]> => {
  if (userIds.length === 0) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id,username,avatar_url')
    .in('id', userIds);
  if (error) return [];
  return data as Profile[];
};

const CommentThread = ({ questionId }: { questionId: number }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Top-level comments and thread
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', questionId],
    queryFn: () => fetchComments(questionId),
  });

  // Likes for current page
  const { data: likes = [] } = useQuery({
    queryKey: ['likes', questionId],
    queryFn: fetchLikes,
  });

  // For all users who commented
  const userIds = useMemo(
    () => Array.from(new Set(comments.map((c) => c.user_id))),
    [comments]
  );
  const { data: profiles = [] } = useQuery({
    queryKey: ['commenters', userIds.join('-')],
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
      if (!user) throw new Error('Harus login');
      // Is liked?
      const existing = likes.find(
        (l) => l.comment_id === commentId && l.user_id === user.id
      );
      if (existing) {
        await supabase.from('likes').delete().eq('id', existing.id);
      } else {
        await supabase.from('likes').insert({
          user_id: user.id,
          comment_id: commentId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likes', questionId] });
    },
  });

  // Add comment/reply
  const addCommentMutation = useMutation({
    mutationFn: async (input: { content: string; parentId: string | null }) => {
      if (!user) throw new Error('Harus login');
      await supabase.from('comments').insert({
        content: input.content,
        user_id: user.id,
        question_id: questionId,
        parent_id: input.parentId,
      });
    },
    // Further simplified onSuccess - only invalidate queries and clear top-level input
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', questionId] });
      // Clear top-level comment box if it was a new comment
      if (!variables.parentId) {
        setNewComment('');
      }
      // Individual reply boxes handle their own closing/clearing state
    },
  });

  // Remove replying state - CommentNode will manage its own open/closed state
  const [newComment, setNewComment] = useState<string>('');

  // Like UI helper
  const isLikedByMe = (commentId: string) =>
    !!user &&
    likes.some((l) => l.comment_id === commentId && l.user_id === user.id);

  // Like count
  const likeCount = (commentId: string) =>
    likes.filter((l) => l.comment_id === commentId).length;

  // Post new top-level comment
  const handleNewComment = () => {
    if (!user) return alert('Harus login untuk komentar!');
    if (!newComment.trim()) return;
    addCommentMutation.mutate({ content: newComment, parentId: null });
  };

  // No longer need handleToggleReply here

  // Define props interface for CommentNode - simplified further
  interface CommentNodeProps {
    comment: CommentDB;
    // No props needed for reply state management
  }

  // Wrap CommentNode with React.memo and update props
  const CommentNode = React.memo(function CommentNode({
    comment,
  }: CommentNodeProps) {
    const commenter = profileMap[comment.user_id];
    const children = buildThread(comment.id);
    // Add local state for the reply text within this specific node
    const [localReplyText, setLocalReplyText] = useState<string>('');
    // Add local state for whether this node's reply box is open
    const [isReplyingLocally, setIsReplyingLocally] = useState<boolean>(false);

    // Local function to toggle the reply box for this node
    const toggleReplyLocally = () => {
      setIsReplyingLocally((prev) => !prev);
    };
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
              {commenter?.username?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}

          <div className="flex-1">
            <div className="text-xs font-semibold text-[#865622] flex items-center gap-2">
              @{commenter?.username || 'user'}
              <span className="text-[10px] font-normal text-[#c09a57] ml-2">
                {new Date(comment.created_at).toLocaleString('id-ID', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </span>
            </div>
            <div className="mt-1 text-sm text-[#3b2509]">{comment.content}</div>
            <div className="flex items-center gap-2 mt-1">
              <Button
                size="sm"
                variant={isLikedByMe(comment.id) ? 'default' : 'outline'}
                className={
                  isLikedByMe(comment.id)
                    ? 'bg-[#b88134] text-white border-[#b88134]'
                    : 'border-[#b88134] text-[#b88134] hover:bg-[#f4e1b8]'
                }
                onClick={() => likeMutation.mutate(comment.id)}>
                <ThumbsUp size={15} className="mr-1" />
                {likeCount(comment.id)}
              </Button>
              {user && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-[#865622] px-2 underline"
                  // Use the local toggle function
                  onClick={toggleReplyLocally}>
                  <CornerDownRight className="mr-1" size={13} />
                  Balas
                </Button>
              )}
            </div>
            {/* Use the local isReplyingLocally state */}
            {isReplyingLocally && (
              <div className="mt-2">
                <Textarea
                  // Use the local state for this comment's reply
                  value={localReplyText}
                  className="mb-1"
                  rows={2}
                  placeholder="Tulis balasan..."
                  // Update the local state for this comment's reply
                  onChange={(e) => setLocalReplyText(e.target.value)}
                  // Auto-focus when the reply box appears might be helpful
                  autoFocus
                />
                <Button
                  size="sm"
                  className="bg-[#b88134] text-white"
                  disabled={
                    addCommentMutation.isPending || !localReplyText.trim()
                  } // Disable if local text is empty
                  onClick={() => {
                    // Use the local state for this comment's reply
                    addCommentMutation.mutate({
                      content: localReplyText,
                      parentId: comment.id,
                    });
                    // Clear local state and close reply box immediately after clicking send
                    setLocalReplyText('');
                    setIsReplyingLocally(false);
                  }}>
                  Kirim
                </Button>
              </div>
            )}
          </div>
        </div>
        {/* Recursively render children, passing down props */}
        <div className="pl-4 mt-1">
          {children.map((child) => (
            // Pass only the comment prop
            <CommentNode key={child.id} comment={child} />
          ))}
        </div>
      </div>
    );
  });

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
                  onClick={handleNewComment}>
                  Kirim Komentar
                </Button>
              </div>
            ) : (
              <div className="text-xs text-[#b88134] mb-3">
                <span>
                  <a
                    href="/auth"
                    className="underline text-[#a76d32] hover:text-[#b88134]">
                    Masuk
                  </a>{' '}
                  untuk mengomentari atau membalas.
                </span>
              </div>
            )}
          </div>
          {/* Show thread, passing only comment prop to top-level nodes */}
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
