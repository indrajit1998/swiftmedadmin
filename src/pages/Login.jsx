import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import loginSvg from '../assets/login.svg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      navigate('/');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // The change is here: h-screen and overflow-hidden
    <div className="flex w-full h-screen overflow-hidden">
      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 sm:p-8 bg-gray-100 overflow-y-auto">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-left">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sign In</h1>
            <p className="mt-2 text-gray-600">Sign in to stay connected.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}
            
            <div>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </div>

            <div>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Remember me?
                </label>
                <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot Password?
                </Link>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300 disabled:bg-indigo-400"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side: Image */}
      <div className="hidden md:flex w-1/2 bg-gray-200">
        <img src={loginSvg} alt="Login illustration" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default Login;