import React from 'react';

export const AuthHero: React.FC = () => {
  return (
    <div className="bg-[url('/AuthBG.jpg')] bg-cover bg-center relative hidden lg:flex flex-col justify-between p-12 bg-zinc-900 border-r border-zinc-800 overflow-hidden min-h-screen">

      {/* Top Brand Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl overflow-hidden p-1.5">
          <img
            src="/HyperAILight.png"
            alt="HyperAI Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <span className="text-xl font-bold tracking-wide text-white">HyperAI</span>
      </div>

      {/* Middle Hero Content (Quote & Spec) */}
      <div className="relative z-10 space-y-6 max-w-lg py-8">

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-700/10 border border-yellow-500/20 text-yellow-600 text-xs font-medium backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-600 animate-pulse" />
          Next-Gen Architecture
        </div>

        <div className="text-3xl sm:text-4xl font-semibold leading-tight tracking-tight text-transparent bg-clip-text bg-linear-to-br from-white via-zinc-100 to-zinc-400">
          HyperAI transforms the way developers build & stream{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 via-amber-400 to-orange-500">
            full-stack intelligence.
          </span>
        </div>

      </div>
    </div>
  );
};