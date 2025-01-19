import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SplashScreen } from "./components/SplashScreen";
import { LoginPage } from "./components/LoginPage";
import { Dashboard } from "./components/Dashboard";
import { PatientEntry } from "./components/PatientEntry";
import { PatientList } from "./components/PatientList";
import StatusPage from "./components/StatusPage";

import {TreatmentProvider} from "./context/TreatmentContext"

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <TreatmentProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Dashboard onLogout={() => setIsAuthenticated(false)} />
              ) : (
                <LoginPage onLogin={() => setIsAuthenticated(true)} />
              )
            }
            // element={
            //   isAuthenticated ? (
            //     <Dashboard onLogout={() => setIsAuthenticated(false)} />
            //   ) : (
            //     <LoginPage onLogin={() => setIsAuthenticated(true)} />
            //   )
            // }
          />
          <Route
            path="/patient/new"
            element={isAuthenticated ? <PatientEntry /> : <Navigate to="/" />}
            // element={<PatientEntry />}
          />
          <Route
            path="/patients"
            element={isAuthenticated ? <PatientList /> : <Navigate to="/" />}
          />
          <Route  
            path="/status/:id"
            // element={<StatusPage />}
            element={isAuthenticated ? <StatusPage /> : <Navigate to="/" />}
          />
        </Routes>
      </BrowserRouter>
    </TreatmentProvider>
  );
}

export default App;
