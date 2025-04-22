import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogOut, User, ArrowLeft } from 'lucide-react';

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/auth" />;

  return (
    <main className="min-h-screen py-8 px-4 bg-gray-50 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg max-w-lg w-full p-8">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-20 w-20 mb-2">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} />
            ) : (
              <AvatarFallback>
                <User className="h-10 w-10 text-gray-400" />
              </AvatarFallback>
            )}
          </Avatar>
          <h2 className="text-xl font-bold">
            {profile?.full_name ?? profile?.username ?? user.email}
          </h2>
          <div className="text-gray-500 text-sm">{user.email}</div>
        </div>
        <div className="mb-6">
          <div className="mb-2">
            <span className="font-semibold">Username:</span>{' '}
            {profile?.username || '-'}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Website:</span>{' '}
            {profile?.website ? (
              <a
                href={profile.website}
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener">
                {profile.website}
              </a>
            ) : (
              '-'
            )}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Bergabung:</span>{' '}
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString('id')
              : '-'}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Button variant="destructive" className="flex-1" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
