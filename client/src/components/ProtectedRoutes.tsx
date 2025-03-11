import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Login } from "./Login";
import Register from "./Register";
import App from "../App";
import Homepage from "../Homepage";
import ProjectView from "./ProjectView";
import UserEditFormWrapper from "../UsersListWrapper";
import UserForm from "../UserForm";

const LoadingSpinner = () => (
  
  <div className="d-flex justify-content-center align-items-center vh-100">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => { 
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? <Navigate to="/" replace /> : <>{children}</>;
};

export const AppRoutes = () => {
  const { loading } = useAuth();
  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
        
      />
      <Route path="/" element={<Homepage />} />  
      <Route path="/projects/:id" element={<ProjectView />} />

      <Route path="/profile" element={<UserEditFormWrapper />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};