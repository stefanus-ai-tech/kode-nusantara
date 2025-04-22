
import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Dummy data (as in Index.tsx). In a real app, use global state or fetch by ID
const questions = [
  {
    id: 1,
    title: "Bagaimana cara parsing JSON kompleks di Golang?",
    askedBy: {
      username: "budi_dev",
      reputation: 250,
      badge: "Programmer Handal"
    },
    tags: ["golang", "json", "parsing"],
    answersCount: 2
  },
  {
    id: 2,
    title: "Error 'CORS policy' saat request API dari frontend React ke backend Spring Boot?",
    askedBy: {
      username: "siti_coder",
      reputation: 510,
      badge: "Pahlawan Backend"
    },
    tags: ["react", "spring-boot", "java", "cors", "api"],
    answersCount: 3
  },
  {
    id: 3,
    title: "Cara terbaik deploy aplikasi Node.js ke cloud service lokal (misal Biznet Gio)?",
    askedBy: {
      username: "agus_infra",
      reputation: 120,
      badge: "Pemula Kode"
    },
    tags: ["nodejs", "deployment", "cloud", "biznet-gio", "indonesia"],
    answersCount: 1
  }
];

const QuestionDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const qid = Number(params.id);
  const question = questions.find((q) => q.id === qid);

  if (!question) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-8">
        <div className="mb-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1" size={18} /> Kembali
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center text-gray-400 font-semibold">
            Pertanyaan tidak ditemukan!
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 mt-8">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1" size={18} /> Kembali
        </Button>
        <Link to="/" className="text-sm text-blue-600 underline hover:text-blue-800">
          Halaman Utama
        </Link>
      </div>
      <Card className="shadow-xl bg-gradient-to-tr from-white to-violet-50">
        <CardContent className="p-7">
          <h2 className="text-2xl font-bold mb-2 text-violet-900">{question.title}</h2>
          <div className="flex items-center mt-2 text-sm text-gray-500 mb-4">
            Ditanya oleh{" "}
            <span className="ml-1 font-medium text-gray-800">{question.askedBy.username}</span>
            <span className="mx-1 text-gray-400">·</span>
            <span className={`font-semibold ${
              question.askedBy.reputation >= 500
                ? "text-green-600"
                : question.askedBy.reputation >= 200
                ? "text-yellow-700"
                : "text-gray-700"
            }`}>
              Rep: {question.askedBy.reputation}
            </span>
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-semibold">
              {question.askedBy.badge}
            </span>
          </div>
          <div className="mb-4 flex flex-wrap">
            {question.tags.map((tag) => (
              <span key={tag} className="mr-2 mb-1 inline-block rounded bg-purple-100 text-purple-700 px-2 py-0.5 text-xs">
                {tag}
              </span>
            ))}
          </div>
          <div className="font-semibold text-blue-700">
            Jumlah Jawaban: {question.answersCount}
          </div>
          {/* Placeholder for answers/comments */}
          <div className="mt-6 p-5 rounded bg-yellow-50 text-yellow-900">
            <em>Jawaban dan diskusi akan ditampilkan di sini.</em>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionDetail;
