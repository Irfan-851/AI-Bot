import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = "http://localhost:5000";

// Create the UserContext
const UserContext = createContext();

// Create a provider component
const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to verify token and get user data
    const verifyToken = async (token) => {
        try {
            const response = await axios.get(`${API_BASE}/api/userapi/verify-token`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.user;
        } catch (error) {
            console.error('Token verification failed:', error);
            localStorage.removeItem('token'); // Remove invalid token
            return null;
        }
    };

    // Initialize user authentication on app startup
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                console.log('Token found, verifying...');
                const userData = await verifyToken(token);
                if (userData) {
                    console.log('User authenticated:', userData);
                    setUser(userData);
                } else {
                    console.log('Token invalid, clearing...');
                    setUser(null);
                }
            } else {
                console.log('No token found');
                setUser(null);
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    // Function to login user
    const loginUser = (userData, token) => {
        localStorage.setItem('token', token);
        setUser(userData);
    };

    // Function to logout user
    const logoutUser = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            setUser, 
            loginUser, 
            logoutUser, 
            loading 
        }}>
            {children}
        </UserContext.Provider>
    );
};

// Optional: Custom hook for easier usage
// export const useUser = () => useContext(UserContext);

export { UserProvider, UserContext };









