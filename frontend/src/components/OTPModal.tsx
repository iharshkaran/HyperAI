import React, { useState, useRef, type ChangeEvent, type KeyboardEvent,type ClipboardEvent, type FormEvent } from 'react';
import axios from 'axios';

// 1. Props Type Definition
interface OTPModalProps {
  email: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: any) => void;
}

export default function OTPModal({ email, isOpen, onClose, onSuccess }: OTPModalProps) {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Ref array for input elements
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (!isOpen) return null;

  // Single digit entry & auto-focus
  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Backspace key handling
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Copy-paste handling
  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  // Submit OTP to Backend
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const otpString = otp.join('');
  if (otpString.length !== 6) {
    setError('Please enter complete 6-digit OTP');
    return;
  }

  setLoading(true);
  setError('');

  try {
    const res = await axios.post('http://localhost:3000/api/auth/verify-otp', {
      email,
      otp: otpString,
    }, { withCredentials: true });

    if (res.data.success) {
      onSuccess(res.data.user);
    }
  } catch (err: any) {
    setError(err.response?.data?.message || 'Verification failed. Try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#18181b] p-6 shadow-2xl border border-zinc-800 text-white animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-bold text-center text-indigo-400">Verify Your Email 🚀</h2>
        <p className="mt-2 text-sm text-center text-zinc-400">
          Enter the 6-digit code sent to <br />
          <span className="text-indigo-300 font-medium">{email}</span>
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-[#27272a] border border-zinc-700 text-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>

        <button
          onClick={onClose}
          type="button"
          className="mt-4 w-full text-xs text-center text-zinc-500 hover:text-zinc-400 transition-colors"
        >
          Cancel & Edit Email
        </button>
      </div>
    </div>
  );
}