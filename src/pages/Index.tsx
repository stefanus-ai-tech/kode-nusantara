
import React from "react";

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
    title: "Error 'CORS policy' saat request API dari frontend React ke backend Spring Boot?",
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
    title: "Cara terbaik deploy aplikasi Node.js ke cloud service lokal (misal Biznet Gio)?",
    askedBy: {
      username: "agus_infra",
      reputation: 120,
      badge: "Pemula Kode",
    },
    tags: ["nodejs", "deployment", "cloud", "biznet-gio", "indonesia"],
    answersCount: 1,
  },
];

const Badge = ({ badge }: { badge: string }) => (
  <span className="ml-2 inline-block rounded bg-green-100 text-green-800 px-2 py-0.5 text-xs font-semibold">
    {badge}
  </span>
);

const Tag = ({ tag }: { tag: string }) => (
  <span className="mr-2 mb-1 inline-block rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-700">
    {tag}
  </span>
);

const QuestionCard = ({ question }: { question: Question }) => (
  <div className="bg-white rounded-lg shadow-sm p-5 mb-4 hover:shadow-md transition-shadow cursor-pointer">
    <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
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
  </div>
);

const Index = () => {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
          KodeNusantara 🇮🇩
        </h1>
        <p className="text-lg text-gray-600">
          Forum tanya jawab untuk programmer Indonesia. Semangat Gotong Royong
          Koding!
        </p>
      </header>
      <section>
        <h2 className="text-xl font-bold mb-4">Pertanyaan Terbaru:</h2>
        {questions.map((q) => (
          <QuestionCard key={q.id} question={q} />
        ))}
      </section>
      <section className="mt-12 text-center">
        <button
          type="button"
          className="inline-block rounded bg-red-600 px-6 py-3 text-white font-semibold shadow-md hover:bg-red-700 transition-colors"
        >
          + Tanya Pertanyaan Baru
        </button>
      </section>
    </main>
  );
};

export default Index;

