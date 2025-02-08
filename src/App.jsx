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
import { useSelector } from "react-redux";

function App() {
  const authToken = localStorage.getItem("authToken");
  const [showSplash, setShowSplash] = useState(true);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    // If there is no authToken and no user, keep showing the splash screen.
    if (!authToken && !user) {
      setShowSplash(true);
    } else {
      // Otherwise, hide the splash screen.
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
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route path="/register" element={<Register />} />
        <Route
          path="/patient/new"
          element={isAuthenticated ? <PatientEntry /> : <Navigate to="/" />}
        />
        <Route
          path="/patients"
          element={isAuthenticated ? <PatientList /> : <Navigate to="/" />}
        />
        <Route
          path="/status/:id"
          element={isAuthenticated ? <StatusPage /> : <Navigate to="/" />}
        />
        <Route
          path="/PatientHistory"
          element={isAuthenticated ? <PatientHistory /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
