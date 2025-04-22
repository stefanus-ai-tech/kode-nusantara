
import React from "react";
import BatikHeader from "@/components/BatikHeader";
import QuestionList from "@/components/QuestionList";

const Index = () => (
  <main className="min-h-screen bg-gradient-to-br from-[#fffbe8] via-[#e5c494] to-[#b88134]">
    <BatikHeader />
    <div className="max-w-4xl mx-auto px-4 pt-3">
      <QuestionList />
    </div>
  </main>
);

export default Index;
