
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Filter, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type Question = {
  id: number;
  title: string;
  user_id: string;
  tags: string[];
  created_at: string;
  // Could extend with joined profile/user as needed
};

type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

type SortKey = "terbaru" | "terlama" | "jawaban" /* For future */;

const fetchQuestions = async (): Promise<Question[]> => {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

const QuestionList = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortKey>("terbaru");
  const [filterTag, setFilterTag] = useState<string>("");
  const [filterUser, setFilterUser] = useState<string>("");

  // Main questions data
  const { data: questions, isLoading, error } = useQuery({
    queryKey: ["questions"],
    queryFn: fetchQuestions,
  });

  // Fetch all tags and user IDs for filters
  const allTags = useMemo(() => {
    if (!questions) return [];
    const base = questions.flatMap((q) => q.tags).filter(Boolean);
    return Array.from(new Set(base));
  }, [questions]);
  const allUserIds = useMemo(() => {
    if (!questions) return [];
    return Array.from(new Set(questions.map((q) => q.user_id)));
  }, [questions]);

  // Fetch usernames for filters
  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      if (allUserIds.length === 0) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", allUserIds);
      if (error) return [];
      return data as Profile[];
    },
    enabled: allUserIds.length > 0,
  });

  const filteredQuestions = useMemo(() => {
    if (!questions) return [];
    let qs = [...questions];
    if (filterTag) qs = qs.filter((q) => q.tags.includes(filterTag));
    if (filterUser) qs = qs.filter((q) => q.user_id === filterUser);
    // Sort
    if (sortBy === "terbaru") {
      qs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "terlama") {
      qs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    // NOTE: Could add more sort methods (e.g., by answers)
    return qs;
  }, [questions, filterTag, filterUser, sortBy]);

  return (
    <section>
      <div className="mb-3 flex flex-wrap gap-2 items-end justify-between">
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-2 top-2 text-[#7b5c28]" size={16} />
            <select
              className="appearance-none border pl-8 pr-6 py-2 rounded shadow bg-[#fffbe8] text-[#7b5c28]"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
            >
              <option value="">Semua Tag</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <User className="absolute left-2 top-2 text-[#7b5c28]" size={16} />
            <select
              className="appearance-none border pl-8 pr-6 py-2 rounded shadow bg-[#fffbe8] text-[#7b5c28]"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            >
              <option value="">Semua Penanya</option>
              {profiles &&
                profiles.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.username || "User"}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div>
          <select
            className="border pr-6 py-2 rounded shadow bg-[#fffbe8] text-[#7b5c28] font-semibold"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
          >
            <option value="terbaru">
              <ArrowDown className="inline" size={15} /> Terbaru
            </option>
            <option value="terlama">
              <ArrowUp className="inline" size={15} /> Terlama
            </option>
          </select>
        </div>
      </div>

      <h2 className="text-xl mb-4 font-bold text-[#865622]">Pertanyaan Terbaru</h2>
      {isLoading ? (
        <div className="py-8 text-center text-gray-400">Memuat pertanyaan...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">
          Gagal memuat pertanyaan: {error.message}
        </div>
      ) : filteredQuestions.length > 0 ? (
        filteredQuestions.map((question) => {
          const asker = profiles?.find((p) => p.id === question.user_id);
          return (
            <Card
              key={question.id}
              className="cursor-pointer mb-3 bg-gradient-to-tr from-[#fffbe8] via-[#e5c494] to-[#f4e1b8] hover:shadow-lg border border-[#e7c380]"
              onClick={() => navigate(`/question/${question.id}`)}
              tabIndex={0}
              role="button"
            >
              <CardContent className="p-5">
                <h3 className="text-lg font-semibold text-[#8d581d]">
                  {question.title}
                </h3>
                <div className="text-xs mt-2 text-[#693c10] flex flex-wrap gap-2 items-center">
                  {question.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-[#eed9bb] px-2 py-0.5 text-xs font-bold mr-1"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="ml-auto">
                    {asker ? `Ditanya oleh @${asker.username || "user"}` : ""}
                  </span>
                </div>
                <div className="text-[12px] text-[#c09a57] mt-1 flex items-center">
                  {new Date(question.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <div className="py-8 text-center text-gray-400">
          Tidak ada pertanyaan ditemukan.
        </div>
      )}
    </section>
  );
};

export default QuestionList;
