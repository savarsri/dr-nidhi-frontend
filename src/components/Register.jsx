import React, { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTotalPatients } from "../redux/patientSlice.js";
import api from "../api";
import Loader1 from "./Loader1"

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
    const { totalPatients, newPatientsThisMonth } = useSelector((state) => state.patients);

    useEffect(() => {
        const lastFetchTime = localStorage.getItem("lastFetchTime");
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

        if (!totalPatients || !newPatientsThisMonth || !lastFetchTime || (Date.now() - parseInt(lastFetchTime) >= oneHour)) {
            dispatch(fetchTotalPatients());
        }
    }, [dispatch, totalPatients, newPatientsThisMonth]);

    const handleSubmitName = (e) => {
        e.preventDefault();
        if (!username) {
            setError("Please enter username");
            return;
        }
        if (!email) {
            setError("Please enter email");
            return;
        }
        if (!name) {
            setError("Please enter your name");
            return;
        }
        setShowScreen(1);
        setError("");
    };

    const handleSubmitPhone = (e) => {
        e.preventDefault();
        if (!username) {
            setError("Please enter username");
            return;
        }
        if (!email) {
            setError("Please enter email");
            return;
        }
        if (!name) {
            setError("Please enter your name");
            return;
        }
        if (!phoneNumber) {
            setError("Please enter phone number");
            return;
        }
        if (!medication) {
            setError("Please enter medication");
            return;
        }
        setShowScreen(2);
        setError("");
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username) {
            setError("Please enter username");
            return;
        }
        if (!email) {
            setError("Please enter email");
            return;
        }
        if (!name) {
            setError("Please enter your name");
            return;
        }
        if (!phoneNumber) {
            setError("Please enter phone number");
            return;
        }
        if (!medication) {
            setError("Please enter medication");
            return;
        }
        if (!password) {
            setError("Please enter password");
            return;
        }
        if (!confirmPassword) {
            setError("Please enter confirm password");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords Does Not Match");
            return;
        }
        setLoading(true)
        try {
            const response = await api.post("/user", {
                username,
                email,
                full_name: name,
                phone_number: phoneNumber,
                medication,
                password,
                role: "doctor"
            });

            if (response.status === 201 || response.status === 200) {
                navigate('/login')
            }
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData && typeof errorData === 'object') {
                const errorMessages = Object.entries(errorData)
                    .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
                    .join(" | ");
                setError(errorMessages);
            } else {
                setError("An error occurred while registering");
            }
        } finally {
            setLoading(false)
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
                        <p className="text-accent mt-2">Register to continue</p>
                    </div>

                    {error && <p className="text-primary text-center mb-4">{error}</p>}

                    {showScreen === 0 ? (
                        <form onSubmit={handleSubmitName} className="space-y-6">
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
                            </div>

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-text">
                                    Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full px-4 py-3 rounded-lg border border-accent focus:ring-primary focus:border-primary bg-white"
                                        placeholder="Enter your name"
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
                        </form>
                    ) : showScreen === 1 ? (
                        <form onSubmit={handleSubmitPhone} className="space-y-6">
                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-text">
                                    Phone Number
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="number"
                                        id="phoneNumber"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="block w-full px-4 py-3 rounded-lg border border-accent focus:ring-primary focus:border-primary bg-white"
                                        placeholder="Enter Phone Number"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <div>
                                    <label
                                        htmlFor="Medication"
                                        className="block text-sm font-medium text-text"
                                    >
                                        Medication Type*
                                    </label>
                                    <select
                                        required
                                        id="Medication"
                                        className="block w-full px-4 py-3 mt-1 rounded-lg border border-accent focus:ring-primary focus:border-primary bg-white"
                                        value={medication}
                                        onChange={(e) =>
                                            setMedication(e.target.value)
                                        }
                                    >
                                        <option value="">Select medication type</option>
                                        <option value="allopathy">Allopathy</option>
                                        <option value="homeopathy">Homeopathy</option>
                                        <option value="ayurveda">Ayurveda</option>
                                    </select>
                                </div>
                            </div>
                            <div className="w-full flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowScreen(0)}
                                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-black bg-red-200 hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    <ArrowLeft className="mr-2 w-4 h-4" />
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-white bg-primary hover:bg-deeper focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    Continue
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
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

                            <div>
                                <label htmlFor="cpass" className="block text-sm font-medium text-text">
                                    Confirm Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="password"
                                        id="cpass"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full px-4 py-3 rounded-lg border border-accent focus:ring-primary focus:border-primary bg-white"
                                        placeholder="Enter confirm password"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="w-full flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowScreen(1)}
                                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-black bg-red-200 hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    <ArrowLeft className="mr-2 w-4 h-4" />
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-white bg-primary hover:bg-deeper focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    Register
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    )}
                    < div className="text-center mb-8">
                        <Link to='/'>
                            <p className="text-accent mt-2">Already have an account? Sign in here</p>
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
        </div >
    );
};
