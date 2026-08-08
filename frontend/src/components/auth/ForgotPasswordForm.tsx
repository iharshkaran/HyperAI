import React, { useState } from 'react';
import { authService } from '../../services/auth.service';

interface ForgotPasswordFormProps {
  onSwitchMode: (mode: 'login') => void;
  onError: (msg: string) => void;
  onInfo: (msg: string) => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSwitchMode,
  onError,
  onInfo,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError('');
    onInfo('');
    setLoading(true);

    try {
      const res = await authService.forgotPassword(email);

      // Explicit success check to avoid false positives
      if (res && !res.success) {
        onError(res.message || 'Failed to request password reset');
        return;
      }

      onInfo('Password reset link sent to your email.');
    } catch (err: any) {
      onError(err.response?.data?.message || err.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Reset Password</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Enter your registered email to receive instructions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
            placeholder="name@example.com"
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all text-sm disabled:opacity-50 cursor-pointer active:scale-[0.99]"
        >
          {loading ? 'Sending Request...' : 'Send Reset Link'}
        </button>
      </form>

      {/* Switch Mode Link */}
      <p className="text-center text-xs text-zinc-400">
        Remembered your password?{' '}
        <button
          type="button"
          onClick={() => onSwitchMode('login')}
          className="text-orange-400 font-medium hover:text-orange-300 transition cursor-pointer"
        >
          Back to Login
        </button>
      </p>
    </div>
  );
};