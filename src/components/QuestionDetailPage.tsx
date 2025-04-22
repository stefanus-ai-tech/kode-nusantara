
import React from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import CommentThread from "@/components/CommentThread";

const fetchQuestionDetail = async (id: number) => {
  // Fetch question and the user profile
  const { data: question, error } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!question) return null;
  const { data: user, error: userErr } = await supabase
    .from("profiles")
    .select("username,avatar_url")
    .eq("id", question.user_id)
    .limit(1)
    .maybeSingle();
  return { ...question, asker: user };
};

const QuestionDetailPage = () => {
  const { id } = useParams();
  const qid = Number(id);

  const { data: question, isLoading, error } = useQuery({
    queryKey: ["question", qid],
    queryFn: () => fetchQuestionDetail(qid),
    enabled: !!qid,
  });

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center text-[#a76d32] underline hover:text-[#e09f27] font-bold"
        >
          &larr; Kembali
        </Link>
      </div>
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-400">
            Memuat pertanyaan...
          </CardContent>
        </Card>
      ) : !question ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-400 font-semibold">
            Pertanyaan tidak ditemukan!
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-xl bg-gradient-to-tr from-[#fffbe8] to-[#e9c893] border-[#e7c380]">
          <CardContent className="p-7">
            <h2 className="text-2xl font-bold mb-2 text-[#a76d32]">{question.title}</h2>
            <div className="flex items-center mt-2 text-sm text-[#b88134] mb-4">
              Ditanya oleh{" "}
              <span className="ml-1 font-medium text-[#8d581d]">
                @{question.asker?.username || "user"}
              </span>
              {question.asker?.avatar_url && (
                <img
                  src={question.asker.avatar_url}
                  alt="avatar"
                  className="ml-3 w-7 h-7 rounded-full border-2 border-[#b88134]"
                />
              )}
            </div>
            <div className="mb-4 flex flex-wrap">
              {question.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="mr-2 mb-1 inline-block rounded bg-[#eed9bb] text-[#915516] px-2 py-0.5 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="font-semibold text-[#c09a57] text-sm mb-4">
              {new Date(question.created_at).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
            {/* Comments thread! */}
            <CommentThread questionId={question.id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuestionDetailPage;
