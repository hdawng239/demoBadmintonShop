import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const [isChecking, setIsChecking] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.role === 'admin') {
                    setIsAdmin(true);
                } else {
                    alert("Tài khoản của bạn không có quyền truy cập trang này!");
                }
            } catch (e) {
                console.error("Lỗi parse user data", e);
            }
        }
        setIsChecking(false);
    }, []);

    if (isChecking) return null; // or a loading spinner

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default AdminRoute;
