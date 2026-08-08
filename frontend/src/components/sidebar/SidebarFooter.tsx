import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import SettingsModal from '../common/SettingsModal';

interface SidebarFooterProps {
    isOpen: boolean;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ isOpen }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [imageError, setImageError] = useState(false);

    const { user } = useAuth();

    // Full Name Construction
    const fullName = user?.fullName
        ? `${user.fullName.firstName || ''} ${user.fullName.lastName || ''}`.trim()
        : user?.email?.split('@')[0] || "User";

    const email = user?.email || "No email";

    return (
        <>
            {/* Bottom Section: User Profile & Single Settings Trigger */}
            <div className="flex flex-col gap-2 py-2 w-full">
                <div className={`flex items-center justify-between w-full ${!isOpen && 'flex-col gap-3'}`}>

                    {/* User Profile Info */}
                    <div className={`flex items-center gap-2.5 min-w-0 flex-1 ${!isOpen && 'justify-center'}`}>
                        {user?.avatar && !imageError ? (
                            <img
                                src={user.avatar}
                                alt="Profile"
                                referrerPolicy="no-referrer"
                                onError={() => setImageError(true)}
                                className="w-8 h-8 rounded-full object-cover border border-(--border) shrink-0"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white uppercase shrink-0">
                                {fullName[0]}
                            </div>
                        )}

                        {/* User Name & Gmail Display */}
                        {isOpen && (
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-xs font-semibold truncate text-(--text)">
                                    {fullName}
                                </span>
                                <span className="text-[11px] text-zinc-400 truncate">
                                    {email}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Settings Button Only */}
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        title="Settings"
                        className="text-(--text) hover:bg-(--border) rounded-full p-2 transition-colors cursor-pointer shrink-0"
                    >
                        <Settings size={18} />
                    </button>

                </div>
            </div>

            {/* Settings Modal (Theme Toggle & Logout options inside) */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                user={user}
            />
        </>
    );
};

export default SidebarFooter;