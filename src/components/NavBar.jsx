import { Layout, LogOut, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../redux/userSlice";
import { useNavigate, useLocation } from "react-router-dom";

const NavBar = () => {
    const location = useLocation();
    const showBackButton = location.pathname !== "/";
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        dispatch(clearUser());
        navigate("/login");
    };

    const getGreeting = () => {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(now.getTime() + istOffset);
        const hour = istTime.getUTCHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    const handleNavigation = () => {
        if (user?.role === "admin") {
            navigate("/admindashboard");
        } else {
            navigate("/");
        }
    };

    const fullName =
        user?.full_name && typeof user.full_name === "string"
            ? user.full_name.charAt(0).toUpperCase() + user.full_name.slice(1)
            : "";

    return (
        <nav className="bg-white shadow-md transition-all duration-500 w-full">
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
                        <div className="flex items-center cursor-pointer" onClick={handleNavigation}>
                            <Layout className="w-6 h-6 text-primary" />
                            <span className="ml-2 text-lg sm:text-xl font-semibold text-text">
                                Dr. Nidhi
                            </span>
                        </div>
                    </div>
                    <h1 className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 text-lg sm:text-xl font-bold text-text text-center">
                        {fullName ? `${getGreeting()}, ${fullName}` : getGreeting()}
                    </h1>
                    <button
                        className="flex items-center text-accent hover:text-deeper transition duration-300 text-sm sm:text-base"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5 mr-1" />
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;