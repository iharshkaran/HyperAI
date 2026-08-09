import React from 'react';

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
}

const SUGGESTIONS = [
  {
    title: "Explain code",
    description: "How does this specific block work?",
    prompt: "Explain code: How does this specific block work?",
  },
  {
    title: "Plan a trip",
    description: "For a 3-day weekend in Goa",
    prompt: "Plan a trip for a 3-day weekend in Goa",
  },
  {
    title: "Write an email",
    description: "To request a deadline extension",
    prompt: "Write an email to request a deadline extension",
  },
  {
    title: "Brainstorm names",
    description: "For my new tech startup",
    prompt: "Brainstorm names for my new tech startup",
  },
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 select-none">
      
      {/* Dynamic Scaling Heading */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-6 sm:mb-8 text-(--text1) text-center tracking-tight">
        How can <span className="bg-linear-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">HyperAI</span> help you today?
      </h1>

      {/*Suggestions Grid*/}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
        {SUGGESTIONS.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(item.prompt)}
            className="flex flex-col justify-between text-left p-3.5 sm:p-4 min-h-25 sm:min-h-30 rounded-xl bg-(--background) border border-(--border) hover:border-amber-500/50 hover:shadow-md active:scale-[0.98] transition-all duration-200 cursor-pointer group"
          >
            <span className="font-semibold text-xs sm:text-sm text-(--text1) leading-snug group-hover:bg-linear-to-r group-hover:from-amber-400 group-hover:to-orange-500 group-hover:bg-clip-text group-hover:text-transparent transition-all">
              {item.title}
            </span>
            <span className="text-[11px] sm:text-xs text-zinc-400 line-clamp-2 leading-snug mt-1.5 sm:mt-0">
              {item.description}
            </span>
          </button>
        ))}
      </div>

    </div>
  );
};

export default WelcomeScreen;