import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role, loginPath = '/admin/login' }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to={loginPath} replace />;
  if (role && user.role && !role.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
