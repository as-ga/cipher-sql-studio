import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function GuestRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) return <div className="auth-loading">Loading...</div>;
  if (user) return <Navigate to="/" replace />;

  return <>{children}</>;
}
