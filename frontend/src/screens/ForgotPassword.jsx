import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = "http://localhost:5000";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/api/userapi/forgotpassword`, { email });
      setMessage(response.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setMessage('');
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
    
        <h2 className="text-2xl text-center font-bold text-green-500 mb-6">Forgot Password</h2>
      
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
        <button type="submit" className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-400 transition duration-200">
          Send Reset Link</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
    {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
        </div>
  );
};
export default ForgotPassword;



