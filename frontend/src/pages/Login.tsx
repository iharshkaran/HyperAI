import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data) {
        setUser(response.data.user || response.data);
        navigate('/'); // Login success hone par dashboard redirect
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
          // Direct backend ke Passport route par bhej do
          window.location.href = `${BASE_URL}/api/auth/google`;
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-zinc-400 text-center text-sm mb-6">Login to continue to HyperAI</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-zinc-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-zinc-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <p className="text-zinc-400 text-center text-sm pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:underline font-medium">
              Sign up
            </Link>
          </p>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full mt-3 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35 11.1H12v3.33h5.36c-.23 1.25-.94 2.31-2 3.03v2.52h3.24c1.9-1.75 2.99-4.32 2.99-7.46 0-.52-.05-1.02-.14-1.42z"
              />
              <path
                fill="currentColor"
                d="M12 21c2.73 0 5.02-.9 6.7-2.45l-3.24-2.52c-.9.6-2.05.97-3.46.97-2.64 0-4.88-1.78-5.68-4.18H3.07v2.63C4.73 18.72 8.12 21 12 21z"
              />
              <path
                fill="currentColor"
                d="M6.32 12.82c-.2-.6-.32-1.24-.32-1.82s.12-1.22.32-1.82V6.55H3.07A9.98 9.98 0 0 0 2 11c0 1.61.39 3.14 1.07 4.45l3.25-2.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.48 0 2.82.51 3.87 1.51l2.9-2.9C17.01 2.24 14.72 1.33 12 1.33 8.12 1.33 4.73 3.61 3.07 6.55l3.25 2.63c.8-2.4 3.04-4.18 5.68-4.18z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};