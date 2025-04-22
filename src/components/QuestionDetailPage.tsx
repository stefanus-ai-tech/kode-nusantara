import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import CommentThread from '@/components/CommentThread';

const fetchQuestionDetail = async (id: number) => {
  // Fetch question and the user profile
  const { data: question, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!question) return null;
  const { data: user, error: userErr } = await supabase
    .from('profiles')
    .select('username,avatar_url')
    .eq('id', question.user_id)
    .limit(1)
    .maybeSingle();
  return { ...question, asker: user };
};

const QuestionDetailPage = () => {
  const { id } = useParams();
  const qid = Number(id);

  const {
    data: question,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['question', qid],
    queryFn: () => fetchQuestionDetail(qid),
    enabled: !!qid,
  });

  return (
    // Adjust padding for smaller screens
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="mb-4 sm:mb-6 flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center text-[#a76d32] underline hover:text-[#e09f27] font-bold text-sm sm:text-base" // Adjust text size
        >
          &larr; Kembali
        </Link>
      </div>
      {isLoading ? (
        <Card>
          {/* Adjust padding */}
          <CardContent className="p-6 sm:p-8 text-center text-gray-400">
            Memuat pertanyaan...
          </CardContent>
        </Card>
      ) : !question ? (
        <Card>
          {/* Adjust padding */}
          <CardContent className="p-6 sm:p-8 text-center text-gray-400 font-semibold">
            Pertanyaan tidak ditemukan!
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg bg-gradient-to-tr from-[#fffbe8]/90 to-[#e9c893]/90 border-[#e7c380]/80">
          {' '}
          {/* Slightly adjusted shadow/opacity */}
          {/* Adjust padding */}
          <CardContent className="p-5 sm:p-7">
            {/* Adjust text size and margin */}
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-[#a76d32]">
              {question.title}
            </h2>
            {/* Adjust layout and spacing for asker info */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs sm:text-sm text-[#b88134] mb-4">
              <span>Ditanya oleh</span>
              <span className="font-medium text-[#8d581d]">
                @{question.asker?.username || 'user'}
              </span>
              {question.asker?.avatar_url ? (
                <img
                  src={question.asker.avatar_url}
                  alt="avatar"
                  // Adjust size and margin
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-[#b88134]"
                />
              ) : null}
            </div>
            {/* Adjust tag spacing */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              {question.tags.map((tag: string) => (
                <span
                  key={tag}
                  // Adjust padding/text size slightly
                  className="inline-block rounded bg-[#eed9bb] text-[#915516] px-2 py-0.5 text-[10px] sm:text-xs">
                  {tag}
                </span>
              ))}
            </div>
            {/* Adjust text size and margin */}
            <div className="font-semibold text-[#c09a57] text-xs sm:text-sm mb-5">
              {new Date(question.created_at).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </div>
            {/* Comments thread - Ensure it's also responsive if needed */}
            <CommentThread questionId={question.id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuestionDetailPage;
