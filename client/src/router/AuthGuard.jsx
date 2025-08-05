import { Outlet, Navigate } from "react-router-dom";

export default function AuthGuard() {
  return localStorage.getItem("token") ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
}
