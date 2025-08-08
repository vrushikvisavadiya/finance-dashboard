// src/router.jsx
import { createBrowserRouter } from "react-router-dom";

import AuthGuard from "@/router/AuthGuard";
import Login from "@/app/auth/Login";
import SignUp from "@/app/auth/SignUp";
import ForgotResetPassword from "./app/auth/ForgotResetPassword";
import VerifyOtp from "./app/auth/VerifyOtp";
// ------------

import DashboardLayout from "@/app/layout/DashboardLayout";
import DashboardHome from "@/app/dashboard/DashboardHome";
import Transactions from "@/app/dashboard/Transactions";
import Categories from "@/app/dashboard/Categories";
import Analytics from "@/app/dashboard/Analytics";
import BudgetsPage from "./app/BudgetsPage/BudgetsPage";
import ProfilePage from "./app/profile/ProfilePage";

/* ---------- ROUTE OBJECT ARRAY ---------- */
export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <SignUp /> },
  { path: "/verify-otp", element: <VerifyOtp /> },
  { path: "/forgot-password", element: <ForgotResetPassword /> },

  {
    element: <AuthGuard />, // protects everything below
    children: [
      {
        element: <DashboardLayout />, // shared sidebar/top-bar layout
        children: [
          { index: true, element: <DashboardHome /> },
          { path: "transactions", element: <Transactions /> },
          { path: "categories", element: <Categories /> },
          { path: "analytics", element: <Analytics /> },
          { path: "budgets", element: <BudgetsPage /> },
          { path: "profile", element: <ProfilePage /> },
        ],
      },
    ],
  },
]);
