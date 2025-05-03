import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { SplashScreen } from "./components/SplashScreen";
import { LoginPage } from "./components/LoginPage";
import { Dashboard } from "./components/Dashboard";
import { PatientEntry } from "./components/PatientEntry";
import { PatientList } from "./components/PatientList";
import { Register } from "./components/Register";
import StatusPage from "./components/StatusPage";
import PatientHistory from "./components/PatientHistory";
import DeviceRegister from "./components/DeviceRegister"
import ProtectedRoute from "./components/ProtectedRoute";
import { useSelector } from "react-redux";
import EmailVerification from "./components/EmailVerification";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const authToken = localStorage.getItem("authToken");
  const [showSplash, setShowSplash] = useState(true);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if ((!authToken && !user) || (authToken && !user)) {
      setShowSplash(true);
    } else {
      setShowSplash(false);
    }
  }, [authToken, user]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  const isAuthenticated = Boolean(authToken && user);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["doctor", "admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />

        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
        />

        <Route
          path="/verify-email"
          element={isAuthenticated ? <EmailVerification /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/verify-email/:uidb64/:token"
          element={<EmailVerification />}
        />

        <Route
          path="/admindashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/new"
          element={
            <ProtectedRoute allowedRoles={["doctor", "admin"]}>
              <PatientEntry />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients"
          element={
            <ProtectedRoute allowedRoles={["doctor", "admin"]}>
              <PatientList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/status/:id"
          element={
            <ProtectedRoute allowedRoles={["doctor", "admin"]}>
              <StatusPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/PatientHistory"
          element={
            <ProtectedRoute allowedRoles={["doctor", "admin"]}>
              <PatientHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/device-register"
          element={
            <ProtectedRoute allowedRoles={["doctor", "admin"]}>
              <DeviceRegister />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
