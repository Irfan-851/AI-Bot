// import React from 'react';
import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import img1 from '../assets/google-color.svg'
import img2 from '../assets/85z_2201_w009_n001_95c_p6_95-removebg-preview.png'


const API_BASE = "http://localhost:5000"; // Update to match your backend port

const Login = () => {
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { loginUser, loading, user } = useContext(UserContext)
    const navigate = useNavigate();

    // Redirect to home if already authenticated
    useEffect(() => {
        if (!loading && user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        axios.post(`${API_BASE}/api/userapi/login`, {
            email,
            password,        
        })
        .then(res => {
            loginUser(res.data.user, res.data.token);
            navigate('/');
            setEmail('')
            setPassword('')
        })
        .catch(error => {
            if (error.response && error.response.data && error.response.data.errors) {
                setError(error.response.data.errors);
            } else {
                setError('Login failed. Please try again.');
            }
        });
        
    };

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

    return (
        <>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            {/* <img src={img2} alt='bg-img' className='w- h-48'/> */}
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl text-center font-bold text-green-500 mb-6">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
                        <input
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                            type="email"
                            id="email"
                            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-400 mb-2" htmlFor="password">Password</label>
                        <input
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                            type="password"
                            id="password"
                            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    {error && (
                        <div className="mb-4 text-red-400 text-center">
                            {typeof error === 'string' ? error : JSON.stringify(error)}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-400 transition duration-200"
                    >
                        Login
                    </button>
                </form>
                
                <Link to="/ForgotPassword" className="text-green-500 hover:underline">
                        Forgot Password
                    </Link>


                    <div className="mt-1">
                    <Link to="http://localhost:5000/auth/google">
    <button className="px-4 py-2  bg-green-600 hover:bg-green-400 flex gap-2 border-slate-200 rounded-lg text-white       
       text-sm">
        <img className="w-4 h-4 mt-1" src={img1} loading="lazy" alt="google logo"/>
        <span> Google</span>
    </button>
    </Link>
</div>


                <p className="text-gray-400 mt-4">
                    Dont have an account?{' '}
                    <Link to="/register" className="text-green-500 hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
        </>
    );
};

export default Login;