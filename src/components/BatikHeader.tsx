
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const BATIK_GRADIENT =
  "bg-gradient-to-r from-[#a76d32] via-[#e7c380] to-[#fffbe8]"; // Indonesian-batik-inspired

const BatikHeader = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  return (
    <header
      className={`${BATIK_GRADIENT} w-full py-4 px-2 shadow-md border-b border-[#bca36b] mb-6`}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="https://cdn.discordapp.com/attachments/1119885301872070706/1239190508361949214/batik-logo.png" // You can upload/localize later
            alt="Batik"
            className="h-10 w-10 rounded-full border-2 border-[#b88134] bg-white object-cover shadow"
          />
          <div>
            <Link
              to="/"
              className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#a76d32] via-[#b88134] to-[#e09f27] bg-clip-text text-transparent"
            >
              KodeNusantara
            </Link>
            <span className="block text-xs ml-1 font-semibold text-[#905826] tracking-wide">
              #SemangatBatikCoding
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            className="bg-[#b88134] hover:bg-[#a97028] text-white rounded-lg px-4 py-2 shadow font-semibold"
            size="lg"
            onClick={() => navigate("/tanya-pertanyaan-baru")}
          >
            <Plus className="mr-2" size={18} />
            Tanya Pertanyaan
          </Button>
          {!loading && !user && (
            <Link
              to="/auth"
              className="inline-flex items-center px-4 py-2 rounded bg-[#e09f27] hover:bg-[#d39100] text-white font-bold shadow transition"
            >
              <User className="mr-2" size={17} />
              Masuk/Daftar
            </Link>
          )}
          {!loading && user && (
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 rounded bg-green-700 hover:bg-green-800 text-white font-bold shadow"
            >
              <User className="mr-2" size={17} />
              Profil
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
export default BatikHeader;
