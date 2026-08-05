import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AuthSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (token && userParam) {
      try {
        // 1. User payload decode karo
        const userData = JSON.parse(decodeURIComponent(userParam));

        // 2. LocalStorage me dono save karo
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        // 3. AuthContext me update karo
        setUser(userData);

        // 4. Hard redirect (taaki React App ek baar fresh reload hoke localStorage se state pick kar le)
        window.location.href = '/';
      } catch (err) {
        console.error("AuthSuccess parse error:", err);
        window.location.href = '/login';
      }
    } else {
      window.location.href = '/login';
    }
  }, [searchParams, setUser]);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
      <p className="text-gray-400 font-medium">Completing Google Sign-In...</p>
    </div>
  );
};