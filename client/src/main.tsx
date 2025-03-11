import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.js";
import { AuthProvider } from "./context/AuthContext";
import { AppRoutes } from "./components/ProtectedRoutes";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter> {/* ✅ Wrap everything inside BrowserRouter */}
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>

  </React.StrictMode>
);
