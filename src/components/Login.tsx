import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config';
import { Input } from './ui/input';
import { motion } from 'framer-motion';

interface LoginProps {
  setUser: (user: { token: string } | null) => void;
}

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    {open ? (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z"
      />
    ) : (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3l18 18M2.25 12s3.75-7.5 9.75-7.5c2.28 0 4.36.7 6.13 1.87M21.75 12s-3.75 7.5-9.75 7.5c-2.28 0-4.36-.7-6.13-1.87"
        />
      </>
    )}
  </svg>
);

const Login: React.FC<LoginProps> = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post(API_ENDPOINTS.LOGIN, formData);
      const { token } = response.data;
      localStorage.setItem('token', token);
      setUser({ token });
      // Decode JWT to check is_admin
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.is_admin) {
        navigate('/admin');
      } else {
        navigate('/my-team');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-orange-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 px-2">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md px-8 py-10 rounded-3xl shadow-2xl border border-blue-100 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md relative"
      >
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="inline-block w-3 h-3 rounded-full bg-orange-500 animate-pulse"></span>
          <span className="inline-block w-3 h-3 rounded-full bg-pink-500 animate-pulse"></span>
        </div>
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-800 dark:text-blue-300 tracking-tight drop-shadow">Sign in to your account</h2>
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Email
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="aarav.85.2027@doonschool.com?"
            />
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Password
            </label>
            <Input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-xl hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 font-bold text-lg shadow-lg transition duration-200 transform hover:scale-105 mt-2"
          >
            Login
          </button>
        </form>
        <div className="flex justify-center mt-6">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-orange-600 hover:underline font-semibold">
              Sign Up here
            </Link>
          </p>
        </div>
        <div className="mt-2 text-center">
          <Link to="/" className="text-xs text-blue-500 hover:underline">&larr; Back to Home</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

 