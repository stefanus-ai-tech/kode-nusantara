
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, User, Plus, ArrowDown, ArrowUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Question = {
  id: number;
  title: string;
  askedBy: {
    username: string;
    reputation: number;
    badge: string;
  };
  tags: string[];
  answersCount: number;
};

const questions: Question[] = [
  {
    id: 1,
    title: "Bagaimana cara parsing JSON kompleks di Golang?",
    askedBy: {
      username: "budi_dev",
      reputation: 250,
      badge: "Programmer Handal",
    },
    tags: ["golang", "json", "parsing"],
    answersCount: 2,
  },
  {
    id: 2,
    title:
      "Error 'CORS policy' saat request API dari frontend React ke backend Spring Boot?",
    askedBy: {
      username: "siti_coder",
      reputation: 510,
      badge: "Pahlawan Backend",
    },
    tags: ["react", "spring-boot", "java", "cors", "api"],
    answersCount: 3,
  },
  {
    id: 3,
    title:
      "Cara terbaik deploy aplikasi Node.js ke cloud service lokal (misal Biznet Gio)?",
    askedBy: {
      username: "agus_infra",
      reputation: 120,
      badge: "Pemula Kode",
    },
    tags: ["nodejs", "deployment", "cloud", "biznet-gio", "indonesia"],
    answersCount: 1,
  },
];

const allTags = Array.from(
  new Set(questions.flatMap((q) => q.tags))
).sort();
const allUsernames = Array.from(
  new Set(questions.map((q) => q.askedBy.username))
).sort();

const Badge = ({ badge }: { badge: string }) => (
  <span className="ml-2 inline-block rounded bg-green-100 text-green-800 px-2 py-0.5 text-xs font-semibold">
    {badge}
  </span>
);

const Tag = ({ tag }: { tag: string }) => (
  <span className="mr-2 mb-1 inline-block rounded border border-gray-200 bg-muted px-2 py-0.5 text-xs text-gray-700">
    {tag}
  </span>
);

const QuestionCard = ({
  question,
  onClick,
}: {
  question: Question;
  onClick: () => void;
}) => (
  <Card
    className="group cursor-pointer transition-all border shadow-sm hover:shadow-lg mb-4 bg-gradient-to-tr from-white via-purple-50 to-blue-50"
    onClick={onClick}
  >
    <CardContent className="p-5">
      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-violet-700">
        {question.title}
      </h3>
      <div className="flex items-center mt-2 text-sm text-gray-600">
        <div>
          Ditanya oleh{" "}
          <span className="font-medium text-gray-800 hover:underline">
            {question.askedBy.username}
          </span>{" "}
          (Rep:{" "}
          <span
            className={`font-semibold ${
              question.askedBy.reputation >= 500
                ? "text-green-600"
                : question.askedBy.reputation >= 200
                ? "text-yellow-700"
                : "text-gray-700"
            }`}
          >
            {question.askedBy.reputation}
          </span>
          )
          <Badge badge={question.askedBy.badge} />
        </div>
      </div>
      <div className="mt-2 flex flex-wrap">
        {question.tags.map((tag) => (
          <Tag key={tag} tag={tag} />
        ))}
      </div>
      <div className="mt-3 text-sm font-medium text-blue-600">
        Jawaban: {question.answersCount}
      </div>
    </CardContent>
  </Card>
);

type SortKey = "terbaru" | "jawaban" | "reputasi";

const sortingMethods: { key: SortKey; label: string; icon: React.ReactNode }[] =
  [
    {
      key: "terbaru",
      label: "Terbaru",
      icon: <ArrowDown size={16} />,
    },
    {
      key: "jawaban",
      label: "Jawaban Terbanyak",
      icon: <ArrowUp size={16} />,
    },
    {
      key: "reputasi",
      label: "Reputasi Penanya",
      icon: <ArrowUp size={16} />,
    },
  ];

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  // Filter and sort state
  const [sortBy, setSortBy] = useState<SortKey>("terbaru");
  const [filterTag, setFilterTag] = useState<string>("");
  const [filterUsername, setFilterUsername] = useState<string>("");

  const filteredQuestions = useMemo(() => {
    let qs = questions.slice();

    // Filter
    if (filterTag) qs = qs.filter((q) => q.tags.includes(filterTag));
    if (filterUsername) qs = qs.filter((q) => q.askedBy.username === filterUsername);

    // Sort
    switch (sortBy) {
      case "terbaru":
        qs.sort((a, b) => b.id - a.id);
        break;
      case "jawaban":
        qs.sort((a, b) => b.answersCount - a.answersCount);
        break;
      case "reputasi":
        qs.sort((a, b) => b.askedBy.reputation - a.askedBy.reputation);
        break;
      default:
        break;
    }
    return qs;
  }, [sortBy, filterTag, filterUsername]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-violet-50 px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-center sm:text-left">
        <div>
          <h1 className="text-3xl font-extrabold text-violet-700 mb-1 tracking-tight bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow">
            KodeNusantara 🇮🇩
          </h1>
          <p className="text-lg text-gray-500">
            Forum tanya jawab programmer Indonesia. <span className="italic">Semangat Gotong Royong Koding!</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            className="bg-red-600 hover:bg-red-700"
            size="lg"
            onClick={() => navigate("/tanya-pertanyaan-baru")}
          >
            <Plus className="mr-2" size={18} /> Tambah Pertanyaan
          </Button>
          {!loading && !user && (
            <Link
              to="/auth"
              className="inline-flex items-center px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium shadow transition-colors"
            >
              <LogIn className="w-4 h-4 mr-2" /> Masuk / Daftar
            </Link>
          )}
          {!loading && user && (
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-medium shadow transition-colors"
            >
              <User className="w-4 h-4 mr-2" /> Profil
            </Link>
          )}
        </div>
      </header>

      <section className="mb-4 flex flex-col md:flex-row justify-between gap-2 items-start md:items-end">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Filter className="absolute left-2 top-2 text-gray-400 pointer-events-none" size={16} />
            <select
              className="appearance-none border pl-8 pr-6 py-2 rounded shadow-sm bg-white focus:ring-2 focus:ring-violet-300 transition-all"
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
            <User className="absolute left-2 top-2 text-gray-400 pointer-events-none" size={16} />
            <select
              className="appearance-none border pl-8 pr-6 py-2 rounded shadow-sm bg-white focus:ring-2 focus:ring-violet-300 transition-all"
              value={filterUsername}
              onChange={(e) => setFilterUsername(e.target.value)}
            >
              <option value="">Semua Penanya</option>
              {allUsernames.map((uname) => (
                <option key={uname} value={uname}>
                  {uname}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <select
            className="border pl-6 pr-6 py-2 rounded shadow-sm bg-white focus:ring-2 focus:ring-blue-300 font-semibold"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
          >
            {sortingMethods.map((sm) => (
              <option key={sm.key} value={sm.key}>
                {sm.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 text-violet-900">Pertanyaan Terbaru:</h2>
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              onClick={() => navigate(`/question/${q.id}`)}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-400">
            Tidak ada pertanyaan ditemukan.
          </div>
        )}
      </section>
    </main>
  );
};

export default Index;
