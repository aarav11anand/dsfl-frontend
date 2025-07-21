import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config';
import { Input } from './ui/input';
import { motion } from 'framer-motion';

interface SignupProps {
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

const Signup: React.FC<SignupProps> = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    house: '',
    user_type: 'student' // Default to student
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // If switching to teacher, clear house
    if (name === 'user_type' && value === 'teacher') {
      setFormData({
        ...formData,
        user_type: value,
        house: ''
      });
    } else {
    setFormData({
      ...formData,
        [name]: value
    });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate email and password match
    if (formData.email !== formData.confirmEmail) {
      setError('Emails do not match');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    // Teacher email validation
    if (formData.user_type === 'teacher') {
      const teacherEmailRegex = /^[a-z]{3}@doonschool\.com$/;
      if (!teacherEmailRegex.test(formData.email)) {
        setError('Teacher email must be in the format: initials@doonschool.com (e.g., hgt@doonschool.com)');
        return;
      }
    }
    try {
      const response = await axios.post(
        `${API_ENDPOINTS.SIGNUP}`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          house: formData.user_type === 'student' ? formData.house : null,
          user_type: formData.user_type
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      if (response.status === 201) {
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during signup');
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
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-800 dark:text-blue-300 tracking-tight drop-shadow">Create your account</h2>
        {error && <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-4 flex items-center gap-2"><svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder={formData.user_type === 'teacher' ? 'hgt@doonschool.com' : 'aarav.85.2027@doonschool.com'}
            />
            {formData.user_type === 'teacher' && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Use your initials (e.g., hgt@doonschool.com)
              </div>
            )}
          </div>
          <div>
            <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Confirm Email
            </label>
            <Input
              id="confirmEmail"
              name="confirmEmail"
              type="email"
              autoComplete="email"
              required
              value={formData.confirmEmail}
              onChange={handleChange}
              placeholder={formData.user_type === 'teacher' ? 'hgt@doonschool.com' : 'aarav.85.2027@doonschool.com'}
            />
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
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
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Must be at least 8 characters, include a letter and a number.
            </div>
          </div>
          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              <EyeIcon open={showConfirmPassword} />
            </button>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-white text-sm font-semibold mb-2" htmlFor="user_type">
              I am a
            </label>
            <select
              id="user_type"
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 transition duration-200 hover:border-orange-400 hover:shadow-sm"
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          {formData.user_type === 'student' && (
            <div>
              <label className="block text-gray-700 dark:text-white text-sm font-semibold mb-2" htmlFor="house">
                House
              </label>
              <select
                id="house"
                name="house"
                value={formData.house}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 transition duration-200 hover:border-orange-400 hover:shadow-sm"
                required
              >
                <option value="">Select your house</option>
                <option value="Tata">Tata</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Kashmir">Kashmir</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Oberoi">Oberoi</option>
              </select>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-xl hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 font-bold text-lg shadow-lg transition duration-200 transform hover:scale-105 mt-2"
          >
            Sign Up
          </button>
        </form>
        <p className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 mt-6 text-center">
          Have an account?{' '}
          <Link to="/login" className="text-orange-600 hover:underline font-semibold">
            Sign in
          </Link>
        </p>
        <div className="mt-2 text-center">
          <Link to="/" className="text-xs text-blue-500 hover:underline">&larr; Back to Home</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup; 