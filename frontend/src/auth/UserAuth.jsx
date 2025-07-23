import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const UserAuth = ({ children }) => {
    const { user, loading } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Only redirect if not loading and user is not authenticated
        if (!loading && !user) {
            console.log('User not authenticated, redirecting to login');
            navigate('/login');
        }
    }, [user, loading, navigate]);

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-blue-100 to-green-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-xl font-semibold text-gray-700">Loading...</div>
                </div>
            </div>
        );
    }

    // If user is authenticated, render children
    if (user) {
        return <>{children}</>;
    }

    // If not authenticated and not loading, this will redirect to login
    return null;
};

export default UserAuth;