import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    // headers will be set dynamically
});

// Add a request interceptor to always use the latest token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            delete config.headers.Authorization;
        }
        // config.headers['Content-Type'] = 'application/json'; // Uncomment if needed
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;
