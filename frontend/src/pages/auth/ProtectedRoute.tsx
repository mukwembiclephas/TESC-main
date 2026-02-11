// src/components/auth/ProtectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { accessToken } = useAuth();
  

  if (!accessToken) {
    // If the user is not authenticated, redirect them to the login page
    return <Navigate to="/" replace />;
  }

  // If the user is authenticated, render the child components
  return <>{children}</>;
};

export default ProtectedRoute;