import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth";

export const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userPayload = searchParams.get('user');

    if (token && userPayload) {
      try {
        const userData = JSON.parse(decodeURIComponent(userPayload));

        // 1. Agar token localStorage me rakhte ho toh backup ke liye set kar do
        localStorage.setItem('token', token);

        // 2. Auth context state update karo
        if (setUser) {
          setUser(userData);
        }

        // 3. Full page reload ke saath home page par bhejo 
        // (Isse AuthContext fresh cookie read kar leta hai)
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