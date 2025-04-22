
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BatikHeader from "@/components/BatikHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BadgePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const sampleTags = [
  "React", "JavaScript", "Supabase", "Tailwind", "Shadcn", "Vite", "TypeScript",
  "Next.js", "AI", "UI/UX", "Backend"
];

const TanyaPertanyaanBaru = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fffbe8] via-[#e5c494] to-[#b88134]">
        <BatikHeader />
        <div className="flex justify-center items-center h-96">Memuat...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fffbe8] via-[#e5c494] to-[#b88134]">
        <BatikHeader />
        <div className="flex justify-center items-center h-96">
          <div className="bg-white rounded-lg p-6 shadow text-center">
            <div className="mb-2 text-xl font-bold text-[#7b5c28]">Akses Ditolak</div>
            <div>Anda harus masuk untuk mengajukan pertanyaan.</div>
            <Button className="mt-4" onClick={() => navigate("/auth")}>
              Login / Daftar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleTagClick = (tag: string) => {
    setTags((old) =>
      old.includes(tag) ? old.filter((t) => t !== tag) : [...old, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Judul pertanyaan wajib diisi.");
      return;
    }
    setSubmitting(true);
    // Insert to Supabase
    const { error: supaErr } = await supabase.from("questions").insert([
      {
        title: title.trim(),
        tags,
        user_id: user.id,
        // created_at/updated_at handled by db defaults
      },
    ]);
    setSubmitting(false);
    if (supaErr) {
      setError("Gagal mempost pertanyaan! " + supaErr.message);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffbe8] via-[#e5c494] to-[#b88134]">
      <BatikHeader />
      <div className="max-w-lg mx-auto bg-white bg-opacity-90 rounded-xl shadow-2xl mt-10 p-8 border border-[#ebd29a]">
        <h1 className="text-3xl font-extrabold mb-2 text-[#7b5c28] flex items-center gap-2">
          <BadgePlus size={28} /> Tanya Pertanyaan Baru
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="font-semibold text-[#9a723a] mb-1 block">
              Judul Pertanyaan
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Misal: 'Bagaimana cara deploy React di Netlify?'"
              maxLength={120}
              className="border-brown-300 bg-[#fffbe8] rounded"
              required
              disabled={submitting}
            />
          </div>
          <div>
            <label className="font-semibold text-[#9a723a] mb-1 block">
              Tag (opsional)
            </label>
            <div className="flex flex-wrap gap-2">
              {sampleTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`px-3 py-1 rounded-xl border text-xs font-bold ${
                    tags.includes(tag)
                      ? "bg-[#b88134] text-white border-[#99702e]"
                      : "bg-[#f5e5ce] text-[#7b5c28] border-[#ead7b6]"
                  } transition`}
                  onClick={() => handleTagClick(tag)}
                  disabled={submitting}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          {error && (
            <div className="text-red-600 font-semibold">{error}</div>
          )}
          <Button
            className="w-full mt-2 bg-[#b88134] hover:bg-[#a76d32] text-lg py-3 rounded-xl font-bold shadow"
            size="lg"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Mengirim..." : "Kirim Pertanyaan"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default TanyaPertanyaanBaru;
