import React from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";

export default function RoleRoute({ allowedRoles = [], children }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role))
    return <Navigate to="/dashboard" replace />;
  return children;
}
