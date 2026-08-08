import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import GoogleBtn from './GoogleBtn';

interface RegisterFormProps {
  onSuccess: (email: string) => void;
  onSwitchMode: (mode: 'login') => void;
  onError: (msg: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchMode, onError }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth(); // 1. Hook Integration

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError('');
    setLoading(true);

    try {
      const res = await register({
        fullName: { firstName, lastName },
        email,
        password,
      });

      // 2. Explicit Error Checking
      if (res && !res.success) {
        onError(res.message || 'Registration failed');
        return;
      }

      onSuccess(email);
    } catch (err: any) {
      onError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Create an Account</h2>
        <p className="text-sm text-zinc-400 mt-1">Get started with HyperAI today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First & Last Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              placeholder="e.g. John"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              placeholder="e.g. Doe"
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
            placeholder="john@example.com"
          />
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
            placeholder="••••••••"
          />
        </div>

        {/* Orange Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all text-sm disabled:opacity-50 cursor-pointer active:scale-[0.99]"
        >
          {loading ? 'Creating Account...' : 'Register'}
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

      {/* Login Switcher */}
      <p className="text-center text-xs text-zinc-400">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => onSwitchMode('login')}
          className="text-orange-400 font-medium hover:text-orange-300 transition cursor-pointer"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};