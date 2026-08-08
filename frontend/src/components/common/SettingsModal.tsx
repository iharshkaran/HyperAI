import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Mail, Sun, Moon, LogOut, Check, Edit3, Loader2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import LogoutConfirmationModal from './LogoutConfirmationModal';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user }) => {
    const { theme, toggleTheme } = useAppContext();
    const { logout, updateProfile } = useAuth();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Logout Confirmation Popup State
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        if (user?.fullName) {
            setFirstName(user.fullName.firstName || '');
            setLastName(user.fullName.lastName || '');
        }
    }, [user]);

    if (!isOpen) return null;

    const fullNameDisplay = user?.fullName?.firstName
        ? `${user.fullName.firstName} ${user.fullName.lastName || ''}`.trim()
        : "User";

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName.trim()) {
            setErrorMessage("First name required hai.");
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        const res = await updateProfile({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
        } as any);

        setIsLoading(false);

        if (res.success) {
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2500);
        } else {
            setErrorMessage(res.message || "Profile update nahi ho paaya!");
        }
    };

    const handleConfirmLogout = async () => {
        setShowLogoutConfirm(false);
        onClose();
        await logout();
    };

    const modalContent = (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-9999 p-3 sm:p-4">
                <div className="bg-(--background) text-(--text1) border border-(--border) rounded-2xl w-[94vw] max-w-md sm:max-w-lg p-4 sm:p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[88vh]">

                    {/* Header */}
                    <div className="flex justify-between items-center pb-3 border-b border-(--border) mb-4 shrink-0">
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight">Settings</h2>
                        <button
                            onClick={onClose}
                            className="text-zinc-400 hover:text-(--text1) p-1 rounded-lg hover:bg-(--border) transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content Container */}
                    <div className="space-y-5 overflow-y-auto pr-1 flex-1">

                        {/* 1. Account Info */}
                        <section className="space-y-2">
                            <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Account Info</h3>
                            <div className="bg-(--card) p-3.5 sm:p-4 rounded-xl border border-(--border) flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-base uppercase shrink-0 overflow-hidden">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        firstName[0] || 'U'
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-semibold truncate">{fullNameDisplay}</span>
                                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 truncate mt-0.5">
                                        <Mail size={13} className="shrink-0" />
                                        <span className="truncate">{user?.email || "No email provided"}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Edit Profile Name */}
                        <section className="space-y-2">
                            <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Edit Display Name</h3>

                            <form onSubmit={handleSaveProfile} className="bg-(--card) p-3.5 sm:p-4 rounded-xl border border-(--border) space-y-3">

                                {errorMessage && (
                                    <div className="text-xs text-red-500 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                                        {errorMessage}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-zinc-400 mb-1 block">First Name</label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="First Name"
                                            disabled={isLoading}
                                            className="w-full px-3 py-2 text-sm rounded-lg bg-(--background) text-(--text1) border border-(--border) focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-zinc-400 mb-1 block">Last Name</label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Last Name"
                                            disabled={isLoading}
                                            className="w-full px-3 py-2 text-sm rounded-lg bg-(--background) text-(--text1) border border-(--border) focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-1">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5  bg-amber-600 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] disabled:opacity-50 text-white font-medium rounded-xl text-xs transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:shadow-none"
                                    >
                                        {isLoading ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : isSaved ? (
                                            <Check size={14} />
                                        ) : (
                                            <Edit3 size={14} />
                                        )}
                                        <span>{isLoading ? "Saving..." : isSaved ? "Saved!" : "Update Name"}</span>
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* 3. Appearance */}
                        <section className="space-y-2">
                            <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Appearance</h3>
                            <div className="bg-(--card) p-3.5 sm:p-4 rounded-xl border border-(--border) flex flex-row items-center justify-between gap-2">
                                <div>
                                    <p className="text-sm font-medium">Theme Mode</p>
                                    <p className="text-xs text-zinc-400 mt-0.5">Toggle interface appearance.</p>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-(--background) border border-(--border) hover:bg-(--border) text-xs font-medium transition-colors shrink-0 cursor-pointer"
                                >
                                    {theme === 'dark' ? (
                                        <>
                                            <Sun size={15} className="text-amber-400" />
                                            <span>Light</span>
                                        </>
                                    ) : (
                                        <>
                                            <Moon size={15} className="text-indigo-400" />
                                            <span>Dark</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </section>

                        {/* 4. Session / Account Actions */}
                        <section className="space-y-2 pb-1">
                            <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Session</h3>
                            <div className="bg-(--card) p-3.5 sm:p-4 rounded-xl border border-(--border) flex flex-row items-center justify-between gap-2">
                                <div>
                                    <p className="text-sm font-medium">Log out</p>
                                    <p className="text-xs text-zinc-400 mt-0.5">Sign out from this session.</p>
                                </div>
                                <button
                                    onClick={() => setShowLogoutConfirm(true)}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs font-medium transition-colors shrink-0 cursor-pointer"
                                >
                                    <LogOut size={15} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </section>

                    </div>

                </div>
            </div>

            {/* Logout Confirmation Modal Component */}
            <LogoutConfirmationModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleConfirmLogout}
            />
        </>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default SettingsModal;