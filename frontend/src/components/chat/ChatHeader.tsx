import React from 'react';
import { ExternalLink } from 'lucide-react';

export const ChatHeader: React.FC = () => {
  const GITHUB_REPO_URL = "https://github.com/iharshkaran/HyperAI";

  return (
    <header className="absolute top-3.5 right-4 sm:top-4 sm:right-6 z-20 pointer-events-auto">
      <div className="relative group/tooltip flex items-center justify-center">
        {/* GitHub Link Button */}
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="View Project on GitHub"
          className="group flex items-center justify-center gap-2 p-2 sm:px-3.5 sm:py-1.5 bg-(--card) hover:bg-(--box) backdrop-blur-md rounded-full border border-(--border) hover:border-amber-500/50 text-xs text-(--text1) shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          {/* SVG Icon og GitHub*/}
          <svg
            className="w-5 h-5 sm:w-4 sm:h-4 fill-current text-(--text1) group-hover:text-amber-500 group-hover:scale-110 transition-transform duration-200 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
          >
            <path d="M280.5 426.5C214.5 418.5 168 371 168 309.5C168 284.5 177 257.5 192 239.5C185.5 223 186.5 188 194 173.5C214 171 241 181.5 257 196C276 190 296 187 320.5 187C345 187 365 190 383 195.5C398.5 181.5 426 171 446 173.5C453 187 454 222 447.5 239C463.5 258 472 283.5 472 309.5C472 371 425.5 417.5 358.5 426C375.5 437 387 461 387 488.5L387 540.5C387 555.5 399.5 564 414.5 558C505 523.5 576 433 576 321C576 179.5 461 64 319.5 64C178 64 64 179.5 64 321C64 432 134.5 524 229.5 558.5C243 563.5 256 554.5 256 541L256 501C249 504 240 506 232 506C199 506 179.5 488 165.5 454.5C160 441 154 433 142.5 431.5C136.5 431 134.5 428.5 134.5 425.5C134.5 419.5 144.5 415 154.5 415C169 415 181.5 424 194.5 442.5C204.5 457 215 463.5 227.5 463.5C240 463.5 248 459 259.5 447.5C268 439 274.5 431.5 280.5 426.5z" />
          </svg>

          {/* Text */}
          <span className="hidden sm:inline-block font-medium text-(--text1) group-hover:text-amber-500 transition-colors select-none">
            HyperAI v1.0
          </span>

          {/* External Link Icon */}
          <ExternalLink size={12} className="hidden sm:block text-zinc-400 group-hover:text-amber-500 transition-colors" />
        </a>

        {/* Mobile Tooltip*/}
        <div className="sm:hidden absolute top-full right-0 mt-2 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 bg-zinc-900 text-zinc-100 text-[10px] font-medium px-2 py-1 rounded-md shadow-lg whitespace-nowrap border border-zinc-800">
          GitHub Repo
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;