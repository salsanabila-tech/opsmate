import { Navigate, Outlet } from 'react-router-dom';

import { LoaderCircle } from 'lucide-react';

import { useAuth } from '../context/auth-context';

export function ProtectedRoute() {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F8]">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Memulihkan sesi...
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
