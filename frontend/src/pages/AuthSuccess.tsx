import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth";
import { connectSocket } from '../services/socket.service';

export const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();


  useEffect(() => {
    const token = searchParams.get('token');
    const userPayload = searchParams.get('user');

    if (token && userPayload) {
      try {
        const userData = JSON.parse(userPayload); // decodeURIComponent hata diya

        localStorage.setItem('token', token);

        connectSocket(token); // Connect to the socket with the new token

        if (setUser) {
          setUser(userData);
        }

        setTimeout(() => {
          window.location.href = '/';
        }, 100);

      } catch (err) {
        console.error('Failed to parse Google user payload:', err);
        navigate('/login?error=google_failed', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs text-zinc-400 font-medium">Logging in with Google...</p>
    </div>
  );
};