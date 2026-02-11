import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/Login";
import RegisterPage from "../pages/auth/Register";
import DashboardPage from "../pages/Dashboard";
import { AuthContext } from "../context/AuthContext";

const AppRouter = () => {
  const auth = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={auth?.user ? <DashboardPage /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;