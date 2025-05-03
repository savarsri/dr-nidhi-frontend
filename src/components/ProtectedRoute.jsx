// components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const authToken = localStorage.getItem("authToken");
    const { user } = useSelector((state) => state.user);

    const isAuthenticated = Boolean(authToken && user);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }
    
    return children;
};

export default ProtectedRoute;
