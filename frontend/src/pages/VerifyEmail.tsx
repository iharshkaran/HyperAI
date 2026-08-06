import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    axios.get(`http://localhost:3000/api/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
        setTimeout(() => navigate('/login'), 3000); // 3 seconds baad login page pe redirect
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed or link expired.');
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-4">
      <div className="bg-[#1e1e1e] p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-800">
        {status === 'loading' && (
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto mb-4" />
        )}
        <h2 className="text-xl font-bold mb-2">
          {status === 'loading' && 'Verifying Email'}
          {status === 'success' && '✅ Email Verified!'}
          {status === 'error' && '❌ Verification Failed'}
        </h2>
        <p className="text-gray-400 text-sm mb-4">{message}</p>
        {status === 'success' && (
          <p className="text-xs text-indigo-400">Redirecting to login page in 3 seconds...</p>
        )}
      </div>
    </div>
  );
};