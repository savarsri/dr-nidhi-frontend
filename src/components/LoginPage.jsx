import React, { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setTreatmentType } from "../redux/patientSlice";
import { OtpInput } from "./OtpInput";
import { fetchTotalPatients } from "../redux/patientSlice.js";
import { fetchUser } from "../redux/userSlice";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import Loader1 from "./Loader1";

export const LoginPage = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { totalPatients, treatmentType, newPatientsThisMonth } = useSelector((state) => state.patients);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOTPLoading] = useState(false);
  const [showScreen, setShowScreen] = useState(0);

  useEffect(() => {
    const lastFetchTime = localStorage.getItem("lastFetchTime");
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    if (!totalPatients || !newPatientsThisMonth || !lastFetchTime || (Date.now() - parseInt(lastFetchTime) >= oneHour)) {
      dispatch(fetchTotalPatients());
    }
  }, [dispatch, totalPatients, newPatientsThisMonth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      setError("Please enter username");
      return;
    }
    if (!password) {
      setError("Please enter password");
      return;
    }
    setError("");
    setLoading(true)
    try {
      const response = await api.post("/auth/jwt/create", {
        username,
        password,
      });
      if (response.status === 200) {
        localStorage.setItem('authToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        try {
          const user = await dispatch(fetchUser()).unwrap(); // Assuming it returns the user

          // Redirect based on role
          if (user.role === "admin") {
            navigate("/admindashboard");
          } else {
            navigate("/");
          }
        } catch (error) {
          console.error("Failed to fetch user", error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          navigate("/login");
        }
      } else {
        setError("Invalid username or password. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter email");
      return;
    }
    try {
      setOTPLoading(true)
      const response = await api.post("/request-otp", {
        email,
      });
      if (response.status === 200) {
        setShowScreen(2)
      } else {
        setError("Invalid email. Please try again.");
      }
      setOTPLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || "An unexpected error occurred.");
      setOTPLoading(false)
    } finally {
      setOTPLoading(false)
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter email");
      return;
    }
    const numericOtp = parseInt(otp.join(""), 10);
    if (!numericOtp) {
      setError("Please enter otp");
      return;
    }
    setOTPLoading(true)
    try {
      const response = await api.post("/verify-otp", {
        email,
        otp: numericOtp,
      });
      if (response.status === 200) {
        localStorage.setItem('authToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        try {
          const user = await dispatch(fetchUser()).unwrap(); // Assuming it returns the user

          // Redirect based on role
          if (user.role === "admin") {
            navigate("/admindashboard");
          } else {
            navigate("/");
          }
        } catch (error) {
          console.error("Failed to fetch user", error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          navigate("/login");
        }
      } else {
        setError("Invalid OTP. Please try again.");
      }
      setOTPLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || "An unexpected error occurred.");
      setOTPLoading(false)
    } finally {
      setOTPLoading(false)
    }
  };

  if (loading) {
    return <Loader1 />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Diagnosis Counter */}
      <div className="bg-[#FDF5F5] text-[#2D3436] text-center py-2 shadow-md">
        <p className="text-lg font-semibold">
          Total Patient Diagnoses:{" "}
          <span className="text-deeper">{totalPatients}</span>
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img
              src="https://i.postimg.cc/tTqFRJZY/Cancer-Logo.png"
              alt="Logo"
              className="w-240 h-20 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-text">
              Welcome To Dr. NIDHI
            </h1>
            <p className="text-accent mt-2">Sign in to continue</p>
          </div>

          {error && <p className="text-primary text-center mb-4">{error}</p>}

          {showScreen === 1 ? (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text">
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 rounded-lg border border-accent focus:ring-primary focus:border-primary bg-white"
                  placeholder="Enter email"
                  required
                />
              </div>

              <button
                onClick={handleEmailSubmit}
                disabled={otpLoading}
                className={`mt-4 w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-white ${otpLoading ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-deeper"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
              >
                {otpLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 11-8 8z"
                    ></path>
                  </svg>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>

              <hr className="my-6 border-t border-gray-300" />

              <button
                onClick={() => setShowScreen(0)}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-black bg-red-200 hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Login With Password
              </button>
            </div>
          ) : showScreen === 2 ? (
            <>
              <div>
                <label className="block text-sm font-medium text-text text-center mb-4">
                  Enter verification code sent to {email}
                </label>
                <OtpInput length={6} value={otp} onChange={setOtp} />
              </div>
              <button
                onClick={handleOTPSubmit}
                disabled={otpLoading}
                className={`mt-4 w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-white ${otpLoading ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-deeper"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
              >
                {otpLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 11-8 8z"
                    ></path>
                  </svg>
                ) : (
                  <>
                    Verify OTP
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
              <hr className="my-6 border-t border-gray-300" />

              <div className="w-full flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setShowScreen(1)
                    setOtp(Array(6).fill(""))
                    return;
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-black bg-red-200 hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <ArrowLeft className="ml-2 w-4 h-4" />
                  Back
                </button>
                  <button
                    onClick={handleEmailSubmit}
                    disabled={otpLoading}
                    className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-black ${otpLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-200 hover:bg-red-400"
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                  >
                    {otpLoading ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 11-8 8z"
                        ></path>
                      </svg>
                    ) : (
                      <>
                        Resend OTP
                      </>
                    )}
                  </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-text">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg border border-accent focus:ring-primary focus:border-primary bg-white"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="pass" className="block text-sm font-medium text-text">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    id="pass"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg border border-accent focus:ring-primary focus:border-primary bg-white"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-white bg-primary hover:bg-deeper focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Continue
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
              <hr className="my-6 border-t border-gray-300" />
              <button
                onClick={() => setShowScreen(1)}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-black bg-red-200 hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Login With OTP
              </button>
            </form>
          )}
          <div className="text-center mb-8">
            <Link to='/register'>
              <p className="text-accent mt-2">Don't have an account? Register here</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-background border-t border-accent text-center py-4 mt-4">
        <p className="text-sm text-text">
          Product by <strong>Gloport Photonix Innovations Pvt Ltd</strong> | ©
          2025 All Rights Reserved
        </p>
      </div>
    </div>
  );
};
