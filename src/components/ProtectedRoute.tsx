import { useNavigate } from 'react-router';
import { storageService } from '../data/mockData';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!storageService.isAuthenticated()) {
      navigate('/admin');
    }
  }, [navigate]);

  if (!storageService.isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
}
