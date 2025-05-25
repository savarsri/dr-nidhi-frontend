import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // <- useParams instead of useSearchParams
import api from "../api";
import { motion } from "framer-motion";
import NavBar from "./NavBarNew.jsx";

const EmailVerification = () => {
    const { uidb64, token } = useParams(); // <-- capture from path
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (uidb64 && token) {
            verifyEmail();
        }
    }, [uidb64, token]);

    const verifyEmail = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/verify-email/${uidb64}/${token}`);
            setMessage(response.data.message);
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            setMessage(error.response?.data?.message || "Verification failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const resendVerificationEmail = async () => {
        setLoading(true);
        try {
            await api.post("/resend-verification-email");
            setMessage("Verification email resent. Please check your inbox.");
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to resend email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex flex-col bg-background"
        >
            <NavBar />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex-grow flex items-center justify-center"
            >
                <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
                    {loading ? (
                        <h1 className="text-2xl font-bold text-blue-500">Processing...</h1>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold text-green-500 mb-4">Email Verification</h1>
                            <p className="text-gray-700 mb-6">{message || "Please verify your email."}</p>
                            {(!uidb64 || !token) && (
                                <button
                                    onClick={resendVerificationEmail}
                                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                                >
                                    Resend Verification Email
                                </button>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default EmailVerification;
