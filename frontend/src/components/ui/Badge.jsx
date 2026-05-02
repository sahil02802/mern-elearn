import React from "react";

export const Badge = ({ children, variant = "primary", className = "" }) => {
  const variants = {
    primary: "bg-brand-500/10 text-brand-500 border-brand-500/25",
    success: "bg-accent-500/10 text-accent-500 border-accent-500/25",
    warning: "bg-yellow-500/15 text-yellow-500 border-yellow-500/35",
    danger: "bg-red-500/10 text-red-500 border-red-500/30",
    neutral: "bg-surfaceHighlight text-ink-400 border-border",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
