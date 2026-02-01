import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, profileLoading, profileComplete, isAdmin, setPendingRedirect } = useAuth();
  const location = useLocation();

  if (loading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-base text-text-primary transition-colors">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!profileComplete && location.pathname !== '/dashboard') {
    const target = `${location.pathname}${location.search ?? ''}`;
    setPendingRedirect(target);
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
