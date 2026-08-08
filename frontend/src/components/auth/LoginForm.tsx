import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import GoogleBtn from './GoogleBtn';

interface LoginFormProps {
  onSwitchMode: (mode: 'register' | 'forgot') => void;
  onError: (msg: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchMode, onError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError('');
    setLoading(true);

    try {
      // Robust Async Login Call
      const res = await login({ email, password });

      // If hook returns response object instead of throwing error
      if (res && !res.success) {
        onError(res.message || 'Login failed');
        return;
      }
      navigate('/');
    } catch (err: any) {
      console.error('Login Error:', err);
      const errorMessage =
        err.response?.data?.message || err.message || 'Login failed. Please try again.';
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
        <p className="text-sm text-zinc-400 mt-1">Sign in to continue to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
            placeholder="name@example.com"
          />
        </div>

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-zinc-400">Password</label>
            <button
              type="button"
              onClick={() => onSwitchMode('forgot')}
              className="text-xs text-orange-400 hover:text-orange-300 transition cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
            placeholder="••••••••"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all text-sm disabled:opacity-50 cursor-pointer active:scale-[0.99]"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-950 px-2 text-zinc-500">Or</span>
        </div>
      </div>

      {/* Google Login */}
      <GoogleBtn />

      {/* Register Switcher */}
      <p className="text-center text-xs text-zinc-400">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => onSwitchMode('register')}
          className="text-orange-400 font-medium hover:text-orange-300 transition cursor-pointer"
        >
          Sign up
        </button>
      </p>
    </div>
  );
};