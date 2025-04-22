import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Use a random Unsplash image as logo (could randomize by changing id)
const LOGO_URL =
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=60&q=80';

const BATIK_GRADIENT =
  'bg-gradient-to-r from-[#6e4023] via-[#b88134] via-[#e7c380] to-[#fffbe8]'; // Darker brown for even more Indonesian batik vibe

const BatikHeader = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  return (
    <header
      className={`${BATIK_GRADIENT} w-full py-5 px-3 shadow-lg border-b border-[#bca36b] mb-7`}
      style={{
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        boxShadow: '0 8px 36px #dbbe93cc',
      }}>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-0 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={LOGO_URL}
            alt="Batik Logo"
            className="h-12 w-12 rounded-full border-4 border-[#b88134] bg-white object-cover shadow-lg"
            style={{ backgroundColor: '#fffbe8' }}
          />
          <div>
            <Link
              to="/"
              className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#f8e5b6] via-[#f8e5b6] to-[#f8e5b6] bg-clip-text text-transparent drop-shadow">
              KodeNusantara
            </Link>
            <span className="block text-xs ml-1 font-semibold text-[#f8e5b6] tracking-wide italic">
              #SemangatBatikCoding
            </span>
          </div>
        </div>
        <nav className="flex items-center gap-3">
          <Button
            variant="default"
            className={`bg-[#b88134] hover:bg-[#85541a] text-white rounded-full px-6 py-2 shadow-lg text-base font-semibold transition-all
              border-2 border-[#aa782e] ${
                location.pathname === '/tanya-pertanyaan-baru'
                  ? 'ring-2 ring-[#a76d32]'
                  : ''
              }`}
            size="lg"
            onClick={() => navigate('/tanya-pertanyaan-baru')}>
            <PlusCircle className="mr-2" size={22} />
            Tanya Pertanyaan
          </Button>
          {!loading && !user && (
            <Link
              to="/auth"
              className="inline-flex text-base items-center px-6 py-2 rounded-full bg-[#e09f27] hover:bg-[#d39100] text-white font-bold shadow-lg transition">
              <User className="mr-2" size={19} />
              Masuk/Daftar
            </Link>
          )}
          {!loading && user && (
            <Link
              to="/dashboard"
              className="inline-flex text-base items-center px-6 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white font-bold shadow-lg">
              <User className="mr-2" size={19} />
              Profil
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
export default BatikHeader;
