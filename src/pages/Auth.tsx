
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const Auth = () => {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (loading) return <div className="flex justify-center items-center min-h-screen text-gray-700">Loading...</div>;
  if (user) return <Navigate to="/dashboard" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else navigate("/dashboard");
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else {
        setIsLogin(true);
        setError("Sign up successful. Please check your email to confirm your account.");
      }
    }
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">
          {isLogin ? "Masuk ke KodeNusantara" : "Daftar Akun Baru"}
        </h1>
        {error && (
          <div className="flex items-center text-sm mb-3 text-red-600 bg-red-50 p-2 rounded">
            <AlertCircle className="mr-2" size={18} /> {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block mb-1 text-gray-700">Email</label>
          <Input
            type="email"
            value={email}
            disabled={submitting}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            placeholder="alamat@email.com"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 text-gray-700">Kata Sandi</label>
          <Input
            type="password"
            value={password}
            disabled={submitting}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            placeholder="••••••••"
          />
        </div>
        <Button
          className="w-full"
          type="submit"
          variant="default"
          size="lg"
          disabled={submitting}
        >
          {submitting ? (
            isLogin ? "Sedang Masuk..." : "Sedang Mendaftar..."
          ) : isLogin ? (
            "Masuk"
          ) : (
            "Daftar"
          )}
        </Button>
        <div className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? (
            <>
              Belum punya akun?{" "}
              <button
                className="underline font-medium"
                type="button"
                onClick={() => setIsLogin(false)}
                disabled={submitting}
              >
                Daftar
              </button>
            </>
          ) : (
            <>
              Sudah punya akun?{" "}
              <button
                className="underline font-medium"
                type="button"
                onClick={() => setIsLogin(true)}
                disabled={submitting}
              >
                Masuk
              </button>
            </>
          )}
        </div>
      </form>
    </main>
  );
};

export default Auth;
