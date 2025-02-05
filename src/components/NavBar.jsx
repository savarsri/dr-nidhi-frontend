import { Layout, LogOut, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const NavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const showBackButton = location.pathname !== "/";

    const handleLogout = () => {
        Cookies.remove("login");
        window.location.reload()
        navigate('/')
        return;
    }

    return (
        <nav className="bg-white shadow-md transition-all duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 relative">
                    <div className="flex items-center">
                        {showBackButton && (
                            <button
                                onClick={() => navigate(-1)}
                                className="mr-4 text-primary hover:text-deeper transition duration-300"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                        )}
                        <Layout className="w-6 h-6 text-primary" />
                        <span className="ml-2 text-xl font-semibold text-text">
                            Dr. Nidhi
                        </span>
                    </div>
                    <h1 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-text">
                        Good Morning, Dr. Abhijeet
                    </h1>
                    <button
                        className="flex items-center text-accent hover:text-deeper transition duration-300"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5 mr-1" />
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
