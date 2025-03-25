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
import { useSelector } from "react-redux";

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
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
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
          path="/patient/new"
          element={isAuthenticated ? <PatientEntry /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/patients"
          element={isAuthenticated ? <PatientList /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/status/:id"
          element={isAuthenticated ? <StatusPage /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/PatientHistory"
          element={isAuthenticated ? <PatientHistory /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/device-register"
          element={isAuthenticated ? <DeviceRegister /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
