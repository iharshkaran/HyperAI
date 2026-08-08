import React from 'react';
import { Search } from 'lucide-react';

interface SidebarSearchProps {
  isOpen: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SidebarSearch: React.FC<SidebarSearchProps> = ({
  isOpen,
  searchQuery,
  onSearchChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="relative mb-3 mt-1">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)"
      />
      <input
        type="text"
        placeholder="Search chats..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 py-2 pr-4  rounded-lg text-sm bg-(--card) text-(--foreground) placeholder:text-(--muted) outline-none transition"
      />
    </div>
  );
};

export default SidebarSearch;