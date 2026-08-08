import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface OtpFormProps {
  email: string;
  onSwitchMode: (mode: 'register') => void;
  onError: (msg: string) => void;
}

export const OtpForm: React.FC<OtpFormProps> = ({ email: initialEmail, onSwitchMode, onError }) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  // Handle OTP Box Input Change
  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/\D/g, ''); // Numeric only
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input box
    if (index < 5 && value) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace / Navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handle Paste Event
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newOtp = pasteData.split('');
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
    inputRefs.current[Math.min(pasteData.length, 5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError('');

    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      onError('Please enter the complete 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp({ email, otp: fullOtp });

      if (res && !res.success) {
        onError(res.message || 'Invalid or expired OTP');
        return;
      }

      navigate('/');
    } catch (err: any) {
      onError(err.response?.data?.message || err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      onError('Email address is missing');
      return;
    }

    setResending(true);
    onError('');
    try {
      const res = await resendOtp(email);
      if (res && !res.success) {
        onError(res.message || 'Failed to resend OTP');
      }
    } catch (err: any) {
      onError('Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Verify Email</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Enter the 6-digit code sent to <span className="text-zinc-200 font-medium">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Edit Option */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Registered Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
            placeholder="name@example.com"
          />
        </div>

        {/* 6 Separate OTP Digit Input Boxes */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-4 text-center ">
            Verification Code
          </label>
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="w-12 h-12 text-center text-xl font-bold rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              />
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading || otp.join('').length < 6}
          className="w-full bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all text-sm disabled:opacity-50 cursor-pointer active:scale-[0.99]"
        >
          {loading ? 'Verifying...' : 'Verify & Continue'}
        </button>
      </form>

      {/* Resend & Switch Controls */}
      <div className="flex flex-col gap-2 text-center text-xs text-zinc-400">
        <div>
          Didn't receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-orange-400 font-medium hover:text-orange-300 transition cursor-pointer disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>

        <div>
          Wrong email or want to restart?{' '}
          <button
            type="button"
            onClick={() => onSwitchMode('register')}
            className="text-zinc-300 hover:text-white underline transition cursor-pointer"
          >
            Back to Register
          </button>
        </div>
      </div>
    </div>
  );
};