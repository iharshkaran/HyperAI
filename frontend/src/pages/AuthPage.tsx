import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthHero } from '../components/auth/AuthHero';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { OtpForm } from '../components/auth/OtpForm';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm'; // 👈 1. Import Added

export const AuthPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [registeredEmail, setRegisteredEmail] = useState('');
    const [error, setError] = useState('');
    const [infoMsg, setInfoMsg] = useState('');

    // Dynamic URL Mode Mapping (Added 'reset')
    const getModeFromPath = (): 'login' | 'register' | 'otp' | 'forgot' | 'reset' => {
        if (location.pathname.includes('register')) return 'register';
        if (location.pathname.includes('verify-email')) return 'otp';
        if (location.pathname.includes('forgot-password')) return 'forgot';
        if (location.pathname.includes('reset-password')) return 'reset'; // 👈 2. Check Added
        return 'login';
    };

    const mode = getModeFromPath();

    const handleSwitchMode = (targetMode: 'login' | 'register' | 'otp' | 'forgot' | 'reset') => {
        setError('');
        setInfoMsg('');
        const pathMap = {
            login: '/login',
            register: '/register',
            otp: '/verify-email',
            forgot: '/forgot-password',
            reset: '/reset-password',
        };
        navigate(pathMap[targetMode]);
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-zinc-950 text-white">
            {/* Hero Left Section */}
            <AuthHero />

            {/* Dynamic Right Section */}
            <div className="flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-6">

                    {/* Mobile-Only Logo */}
                    <div className="lg:hidden w-8 h-8 rounded-xl p-0.5 mb-4">
                        <img
                            src="/HyperAILight.png"
                            alt="HyperAI Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Error and Info Messages */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3.5 rounded-xl text-sm">
                            {error}
                        </div>
                    )}
                    {infoMsg && (
                        <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 p-3.5 rounded-xl text-sm">
                            {infoMsg}
                        </div>
                    )}

                    {/* Forms Render */}
                    {mode === 'login' && <LoginForm onSwitchMode={handleSwitchMode} onError={setError} />}
                    {mode === 'register' && (
                        <RegisterForm
                            onSuccess={(email) => {
                                setRegisteredEmail(email);
                                handleSwitchMode('otp');
                            }}
                            onSwitchMode={handleSwitchMode}
                            onError={setError}
                        />
                    )}
                    {mode === 'otp' && (
                        <OtpForm email={registeredEmail} onSwitchMode={handleSwitchMode} onError={setError} />
                    )}
                    {mode === 'forgot' && (
                        <ForgotPasswordForm
                            onSwitchMode={handleSwitchMode}
                            onError={setError}
                            onInfo={setInfoMsg}
                        />
                    )}
                    {/* 3. Reset Password Form Rendered */}
                    {mode === 'reset' && (
                        <ResetPasswordForm
                            onError={setError}
                            onInfo={setInfoMsg}
                        />
                    )}

                </div>
            </div>
        </div>
    );
};