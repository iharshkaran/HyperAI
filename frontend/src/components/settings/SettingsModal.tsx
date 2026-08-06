import { X, Trash2, Mail, User as UserIcon } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

const SettingsModal = ({ isOpen, onClose, user }: SettingsModalProps) => {
    if (!isOpen) return null;

    const fullName = user?.fullName?.firstName
        ? `${user.fullName.firstName} ${user.fullName.lastName || ''}`.trim()
        : "User";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
            <div className="bg-[var(--background)] text-[var(--text)] border border-[var(--border)] rounded-xl w-full max-w-md p-6 relative shadow-2xl">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Settings</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-[var(--text)] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Profile Section */}
                <div className="space-y-4 mb-8">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Profile Details</h3>
                    <div className="flex items-center gap-4 bg-[var(--sidebar)] p-4 rounded-lg border border-[var(--border)]">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt="Profile"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
                                {user?.fullName?.firstName[0]}
                            </div>
                        )}
                        <div>
                            <p className="font-medium">{fullName}</p>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                                <Mail size={14} />
                                <span>{user?.email || "No email provided"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-red-500 uppercase tracking-wider">Danger Zone</h3>
                    <div className="bg-[var(--sidebar)] p-4 rounded-lg border border-[var(--border)] flex justify-between items-center">
                        <div>
                            <p className="font-medium">Clear all chats</p>
                            <p className="text-xs text-gray-500 mt-1">Permanently delete all conversation history.</p>
                        </div>
                        <button
                            onClick={() => alert("Clear all chats API call goes here!")}
                            className="flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-3 py-2 rounded-md transition-colors text-sm font-medium cursor-pointer"
                        >
                            <Trash2 size={16} />
                            Clear
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SettingsModal;