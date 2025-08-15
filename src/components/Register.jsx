import React, { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTotalPatients } from "../redux/patientSlice.js";
import api from "../api";
import Loader1 from "./Loader1";
import doctorImgNew from "../assets/ND_BG.png";
import logo from "../assets/logo-nobg.png"

export const Register = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [medication, setMedication] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [showScreen, setShowScreen] = useState(0);
    const [error, setError] = useState("");

    const dispatch = useDispatch();
    const { totalPatients, newPatientsThisMonth } = useSelector(
        (state) => state.patients
    );

    useEffect(() => {
        const lastFetchTime = localStorage.getItem("lastFetchTime");
        const oneHour = 60 * 60 * 1000;

        if (
            !totalPatients ||
            !newPatientsThisMonth ||
            !lastFetchTime ||
            Date.now() - parseInt(lastFetchTime) >= oneHour
        ) {
            dispatch(fetchTotalPatients());
        }
    }, [dispatch, totalPatients, newPatientsThisMonth]);

    const handleSubmitName = (e) => {
        e.preventDefault();
        if (!username) return setError("Please enter username");
        if (!email) return setError("Please enter email");
        if (!name) return setError("Please enter your name");
        setShowScreen(1);
        setError("");
    };

    const handleSubmitPhone = (e) => {
        e.preventDefault();
        if (!username) return setError("Please enter username");
        if (!email) return setError("Please enter email");
        if (!name) return setError("Please enter your name");
        if (!phoneNumber) return setError("Please enter phone number");
        if (!medication) return setError("Please enter medication");
        setShowScreen(2);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username) return setError("Please enter username");
        if (!email) return setError("Please enter email");
        if (!name) return setError("Please enter your name");
        if (!phoneNumber) return setError("Please enter phone number");
        if (!medication) return setError("Please enter medication");
        if (!password) return setError("Please enter password");
        if (!confirmPassword) return setError("Please enter confirm password");
        if (password !== confirmPassword)
            return setError("Passwords Does Not Match");

        setLoading(true);
        try {
            const response = await api.post("/user", {
                username,
                email,
                full_name: name,
                phone_number: phoneNumber,
                medication,
                password,
                role: "doctor",
            });

            if (response.status === 201 || response.status === 200) {
                navigate("/login");
            }
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData && typeof errorData === "object") {
                const errorMessages = Object.entries(errorData)
                    .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
                    .join(" | ");
                setError(errorMessages);
            } else {
                setError("An error occurred while registering");
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader1 />;

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left side: Form */}
            <div className="flex-1 flex flex-col justify-center items-center px-8 py-8">
                {/* Diagnosis Counter */}
                <div className="text-[#2D3436] text-center py-1 shadow-md w-full mb-6">
                    <p className="text-lg font-semibold">
                        Total Patient Diagnoses:{" "}
                        <span className="text-deeper">{totalPatients}</span>
                    </p>
                </div>

                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <h1 className="text-4xl font-bold text-text flex items-center">
                                Welcome to
                                <img
                                    src={logo}
                                    alt="Dr. NIDHI Logo"
                                    className="h-10 object-contain ml-3"
                                />
                            </h1>
                        </div>
                        <p className="text-accent mt-2">Register to continue</p>
                    </div>

                    {error && (
                        <p className="text-primary text-center mb-4">{error}</p>
                    )}

                    {showScreen === 0 && (
                        <form onSubmit={handleSubmitName} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-primary">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full px-4 py-3 rounded-lg border border-primary text-text focus:ring-primary focus:border-primary bg-white"
                                    placeholder="Enter username"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-primary">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full px-4 py-3 rounded-lg border border-primary text-text focus:ring-primary focus:border-primary bg-white"
                                    placeholder="Enter email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-primary">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full px-4 py-3 rounded-lg border border-primary text-text focus:ring-primary focus:border-primary bg-white"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full flex items-center justify-center px-4 py-3 rounded-lg shadow-sm text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                Continue
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                        </form>
                    )}

                    {showScreen === 1 && (
                        <form onSubmit={handleSubmitPhone} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-primary">
                                    Phone Number
                                </label>
                                <input
                                    type="number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="block w-full px-4 py-3 rounded-lg border border-primary text-text focus:ring-primary focus:border-primary bg-white"
                                    placeholder="Enter Phone Number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-primary">
                                    Medication Type*
                                </label>
                                <select
                                    value={medication}
                                    onChange={(e) => setMedication(e.target.value)}
                                    className="block w-full px-4 py-3 rounded-lg border border-primary text-text focus:ring-primary focus:border-primary bg-white"
                                >
                                    <option value="">Select medication type</option>
                                    <option value="allopathy">Allopathy</option>
                                    <option value="homeopathy">Homeopathy</option>
                                    <option value="ayurveda">Ayurveda</option>
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowScreen(0)}
                                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg shadow-sm text-white bg-text hover:bg-text-light"
                                >
                                    <ArrowLeft className="mr-2 w-4 h-4" />
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg shadow-sm text-white bg-primary hover:bg-primary-light"
                                >
                                    Continue
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    )}

                    {showScreen === 2 && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-primary">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full px-4 py-3 rounded-lg border border-primary text-text focus:ring-primary focus:border-primary bg-white"
                                    placeholder="Enter password"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-primary">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full px-4 py-3 rounded-lg border border-primary text-text focus:ring-primary focus:border-primary bg-white"
                                    placeholder="Enter confirm password"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowScreen(1)}
                                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg shadow-sm text-white bg-text hover:bg-text-light"
                                >
                                    <ArrowLeft className="mr-2 w-4 h-4" />
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg shadow-sm text-white bg-primary hover:bg-primary-light"
                                >
                                    Register
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="text-center mt-6">
                        <Link to="/">
                            <p className="text-text mt-2">
                                Already have an account? Sign in here
                            </p>
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-accent text-center py-4 mt-8 w-full">
                    <p className="text-sm text-text">
                        Product by <strong>Gloport Photonix Innovations Pvt Ltd</strong> | ©
                        2025 All Rights Reserved
                    </p>
                </div>
            </div>

            {/* Right side: Image with gradient overlay */}
            <div className="hidden md:flex md:w-1/2 relative">
                <img
                    src={doctorImgNew}
                    alt="Doctor"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/0 to-transparent"></div>
            </div>
        </div>
    );
};
