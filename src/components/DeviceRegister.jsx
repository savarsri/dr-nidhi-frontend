import { motion } from "framer-motion";
import NavBar from "./NavBar.jsx";

const DeviceRegister = () => {
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
                <div className="bg-white p-10 rounded-2xl shadow-lg">
                    <h1 className="text-4xl font-bold text-red-500 text-center">
                        Register your device first with your ID
                    </h1>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DeviceRegister;
