import React from "react";

export const Input = ({ label, error, className = "", ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-ink-400 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`
                        w-full bg-surface border border-border 
                        rounded-xl px-4 py-3 text-ink-100 placeholder-ink-400/70 
            focus:border-brand-500 focus:ring-1 focus:ring-brand-500 
                        focus:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas transition-all duration-300 outline-none disabled:bg-surfaceHighlight/55 disabled:text-ink-400 disabled:cursor-not-allowed
            ${error ? "border-red-500/50 focus:border-red-500 focus:ring-red-500" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-400 ml-1">{error}</p>}
    </div>
  );
};
