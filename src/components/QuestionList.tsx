import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Import Input
import { ArrowDown, ArrowUp, Filter, User, Search } from 'lucide-react'; // Import Search icon
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

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

type SortKey = 'terbaru' | 'terlama' | 'jawaban' /* For future */;

const fetchQuestions = async (): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

const QuestionList = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortKey>('terbaru');
  const [filterTag, setFilterTag] = useState<string>('');
  const [filterUser, setFilterUser] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>(''); // Add search term state

  // Main questions data
  const {
    data: questions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['questions'],
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
    queryKey: ['profiles'],
    queryFn: async () => {
      if (allUserIds.length === 0) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', allUserIds);
      if (error) return [];
      return data as Profile[];
    },
    enabled: allUserIds.length > 0,
  });

  const filteredQuestions = useMemo(() => {
    if (!questions) return [];
    let qs = [...questions];

    // Filter by search term (case-insensitive title search)
    if (searchTerm) {
      qs = qs.filter((q) =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tag and user
    if (filterTag) qs = qs.filter((q) => q.tags.includes(filterTag));
    if (filterUser) qs = qs.filter((q) => q.user_id === filterUser);

    // Sort
    if (sortBy === 'terbaru') {
      qs.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortBy === 'terlama') {
      qs.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
    // NOTE: Could add more sort methods (e.g., by answers)
    return qs;
  }, [questions, filterTag, filterUser, sortBy, searchTerm]); // Add searchTerm dependency

  return (
    <section>
      {/* Search and Filter Controls */}
      <div className="mb-4 flex flex-col md:flex-row md:items-end gap-3">
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari pertanyaan..."
            className="pl-8 w-full bg-[#fffbe8] border-[#e7c380] placeholder:text-[#a1885c]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-[#7b5c28]" />
            <select
              className="appearance-none border pl-8 pr-6 py-2 rounded shadow bg-[#fffbe8] text-[#7b5c28] w-full sm:w-auto"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}>
              <option value="">Semua Tag</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <User className="absolute left-2.5 top-2.5 h-4 w-4 text-[#7b5c28]" />
            <select
              className="appearance-none border pl-8 pr-6 py-2 rounded shadow bg-[#fffbe8] text-[#7b5c28] w-full sm:w-auto"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}>
              <option value="">Semua Penanya</option>
              {profiles &&
                profiles.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.username || 'User'}
                  </option>
                ))}
            </select>
          </div>
        </div>{' '}
        {/* <<<<< ADD THIS MISSING CLOSING TAG */}
        {/* Sort */}
        <div className="flex-shrink-0">
          <select
            className="border pr-6 py-2 rounded shadow bg-[#fffbe8] text-[#7b5c28] font-semibold w-full sm:w-auto"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}>
            <option value="terbaru">
              <ArrowDown className="inline" size={15} /> Terbaru
            </option>
            <option value="terlama">
              <ArrowUp className="inline" size={15} /> Terlama
            </option>
          </select>
        </div>
      </div>

      {/* Question List Title - Adjusted margin */}
      <h2 className="text-xl mb-3 font-bold text-[#865622]">
        {searchTerm || filterTag || filterUser
          ? 'Hasil Pencarian'
          : 'Pertanyaan Terbaru'}
      </h2>
      {isLoading ? (
        <div className="py-8 text-center text-gray-400">
          Memuat pertanyaan...
        </div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">
          Gagal memuat pertanyaan: {error.message}
        </div>
      ) : filteredQuestions.length > 0 ? (
        <div className="space-y-3">
          {' '}
          {/* Add spacing between cards */}
          {filteredQuestions.map((question) => {
            const asker = profiles?.find((p) => p.id === question.user_id);
            return (
              <Card
                key={question.id}
                className="cursor-pointer bg-gradient-to-tr from-[#fffbe8]/80 via-[#e5c494]/80 to-[#f4e1b8]/80 hover:shadow-lg border border-[#e7c380]/70 transition-shadow duration-200"
                onClick={() => navigate(`/question/${question.id}`)}
                tabIndex={0}
                role="button"
                aria-label={`Lihat pertanyaan: ${question.title}`}>
                <CardContent className="p-4 sm:p-5">
                  {' '}
                  {/* Adjust padding for smaller screens */}
                  <h3 className="text-md sm:text-lg font-semibold text-[#8d581d] mb-1">
                    {' '}
                    {/* Adjust text size */}
                    {question.title}
                  </h3>
                  <div className="text-xs text-[#693c10] flex flex-wrap gap-x-2 gap-y-1 items-center mb-2">
                    {' '}
                    {/* Adjust gaps */}
                    {question.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-[#eed9bb] px-2 py-0.5 text-[10px] sm:text-xs font-bold" // Adjust text size
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="text-[11px] sm:text-[12px] text-[#a1885c] flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    {' '}
                    {/* Responsive layout for meta */}
                    <span>
                      {asker ? `Ditanya oleh @${asker.username || 'user'}` : ''}
                    </span>
                    <span className="mt-1 sm:mt-0">
                      {new Date(question.created_at).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          {' '}
          {/* Adjusted text color */}
          Tidak ada pertanyaan yang cocok dengan kriteria pencarian Anda.
        </div>
      )}
    </section>
  );
};

export default QuestionList;
