import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { OtpInput } from "./OtpInput";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { setTreatmentType } from "../redux/patientSlice";

export const Register = ({ onLogin }) => {

    const dispatch = useDispatch();
    const { totalPatients, treatmentType } = useSelector((state) => state.patients);
    const [phone, setPhone] = useState("");
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [error, setError] = useState("");

    const handleSubmitPhone = (e) => {
        e.preventDefault();
        if (!treatmentType) {
            setError("Please select a treatment type");
            return;
        }
        setShowOtp(true);
        setError("");
    };

    const handleSubmitOtp = (e) => {
        e.preventDefault();
        if (otp.join("") === "123456") {
            Cookies.set("login", true);
            onLogin();
        } else {
            setError("Invalid OTP. For demo, use 123456");
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Diagnosis Counter */}
            {/* <div className="bg-[#FDF5F5] text-[#2D3436] text-center py-2 shadow-md">
                <p className="text-lg font-semibold">
                    Total Patient Diagnoses:{" "}
                    <span className="text-deeper">{totalPatients}</span>
                </p>
            </div> */}

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

                    {!showOtp ? (
                        <form onSubmit={handleSubmitPhone} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-text"
                                >
                                    Enter Username
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="tel"
                                        id="username"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="block w-full px-4 py-3 rounded-lg border border-accent focus:ring-primary focus:border-primary bg-white"
                                        placeholder="Enter username"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="phone"
                                    className="block text-sm font-medium text-text"
                                >
                                    Phone Number
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="block w-full px-4 py-3 rounded-lg border border-accent focus:ring-primary focus:border-primary bg-white"
                                        placeholder="Enter your phone number"
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
                    ) : (
                        <form onSubmit={handleSubmitOtp} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-text text-center mb-4">
                                    Enter verification code sent to {phone}
                                </label>
                                <OtpInput length={6} value={otp} onChange={setOtp} />
                                <p className="text-sm text-accent text-center mt-2">
                                    Demo OTP: 123456
                                </p>
                            </div>
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-white bg-primary hover:bg-deeper focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                Verify OTP
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                        </form>
                    )}
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
