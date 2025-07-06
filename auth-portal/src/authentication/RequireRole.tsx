// src/components/RequireRole.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Role } from "../types/User";

const RequireRole = ({
  children,
  allowedRoles,
}: {
  children: React.ReactElement;
  allowedRoles: Role[];
}) => {
  const { currentUser } = useAuth();

  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RequireRole;
