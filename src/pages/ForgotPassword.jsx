import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would make an API call here.
    // For this UI-only version, we just show the success message.
    console.log('Password reset requested for:', email);
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        
        {submitted ? (
          // Success State
          <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500" />
            <h1 className="text-2xl font-bold text-gray-900 mt-4">Request Sent</h1>
            <p className="mt-2 text-gray-600">
              If an account with the email <strong>{email}</strong> exists, you will receive a password reset link shortly.
            </p>
            <div className="mt-6">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          // Initial Form State
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Forgot Password?
              </h1>
              <p className="mt-2 text-gray-600">
                No worries, we'll send you reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
              >
                Send Reset Link
              </button>
            </form>
             <div className="text-center mt-4">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;