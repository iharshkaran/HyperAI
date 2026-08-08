import React from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, X, LogOut } from 'lucide-react';


interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}


const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10000 p-4">
      <div className="bg-(--background) text-(--text1) border border-(--border) rounded-2xl w-[92vw] max-w-sm p-5 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Icon Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-(--text1) p-1 rounded-lg hover:bg-(--border) transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Icon & Header */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight">Log Out Confirmation</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Are you sure you want to log out of your account?
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3 text-xs font-medium rounded-lg border border-(--border) hover:bg-(--border) transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <LogOut size={14} />
            <span>Yes, Log out</span>
          </button>
        </div>

      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default LogoutConfirmationModal;