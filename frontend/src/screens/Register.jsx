import { useState, useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import axios from 'axios'

const API_BASE = "http://localhost:5000"; // Update to match your backend port

const Register = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { loginUser, loading, user } = useContext(UserContext)
    const navigate = useNavigate()

    // Redirect to home if already authenticated
    useEffect(() => {
        if (!loading && user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    const submitHandler = async (e) => {
        e.preventDefault()
        setError('');
        try {
            const res = await axios.post(`${API_BASE}/api/userapi/register`, {
                email,
                password
            })
            loginUser(res.data.user, res.data.token);
            navigate('/')
            setEmail('')
            setPassword('')
        }
        catch (err) {
            if (err.response && err.response.data && err.response.data.errors) {
                setError(
                  Array.isArray(err.response.data.errors)
                    ? err.response.data.errors.map(e => e.msg || e).join(', ')
                    : err.response.data.errors
                );
            } else {
                setError('Registration failed. Please try again.');
            }
        }
    }

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
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-green-500 mb-6">Register</h2>
                <form onSubmit={submitHandler}>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            type="email"
                            id="email"
                            name="email"
                            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
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
                            name="password"
                            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    {error && (
                        <div className="mb-4 text-red-400 text-center">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full p-2 rounded bg-green-600 text-white hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Register
                    </button>
                </form>
                <p className="text-gray-400 mt-4">
                    Already have an account?
                    <Link to="/login" className="text-green-500 hover:underline">  Login</Link>
                </p>
            </div>
        </div>
    )
}

export default Register