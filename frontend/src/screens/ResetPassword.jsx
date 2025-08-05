import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


const API_BASE = "http://localhost:5000";

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await axios.put(`${API_BASE}/api/userapi/resetpassword/${resetToken}`, { password });
      setMessage(response.data.message);
      setError('');
       navigate('/login'), 2000;
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setMessage('');
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl text-center font-bold text-green-500 mb-6">Reset Password</h2>
      
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
                        <label className="block text-gray-400 mb-2" htmlFor="password"> New Password</label>
                        <input
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                            type="password"
                            id="password"
                            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>




                    <div className="mb-6">
                    <label className="block text-gray-400 mb-2" htmlFor="password">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button type="submit"
        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-400 transition duration-200"
        >Reset Password</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
    </div>
  );
};
export default ResetPassword;