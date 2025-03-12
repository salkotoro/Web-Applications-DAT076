import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import HomePage from "./HomePage";
import ProjectManagement from "./ProjectManagement";
import ProjectDetails from "./ProjectDetails";
import ProjectApplicants from "./ProjectApplicants";
import MyApplications from "./MyApplications";
import AllApplicants from "./AllApplicants";
import Profile from "./Profile";
import { Login } from "./Login";
import Register from "./Register";

const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
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
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return isAuthenticated() ? <Navigate to="/" replace /> : <>{children}</>;
};

// Route that only employers can access
const EmployerRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isEmployer, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return isAuthenticated() && isEmployer() ? (
    <>{children}</>
  ) : (
    <Navigate to="/" replace />
  );
};

// Route that only employees can access
const EmployeeRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isEmployee, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return isAuthenticated() && isEmployee() ? (
    <>{children}</>
  ) : (
    <Navigate to="/" replace />
  );
};

const AppRoutes = () => {
  const { loading } = useAuth();
  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <EmployeeRoute>
            <MyApplications />
          </EmployeeRoute>
        }
      />
      <Route
        path="/applicants"
        element={
          <EmployerRoute>
            <AllApplicants />
          </EmployerRoute>
        }
      />
      <Route
        path="/projects/manage"
        element={
          <EmployerRoute>
            <ProjectManagement />
          </EmployerRoute>
        }
      />
      <Route
        path="/projects/:id/applicants"
        element={
          <EmployerRoute>
            <ProjectApplicants />
          </EmployerRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectDetails />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export { AppRoutes };
export default AppRoutes;
