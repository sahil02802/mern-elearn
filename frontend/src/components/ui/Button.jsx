import React from "react";
import { motion } from "framer-motion";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  isLoading = false,
  ...props
}) => {
  const baseStyles =
    "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 overflow-hidden border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-60 disabled:cursor-not-allowed disabled:saturate-75";

  const variants = {
    primary:
      "bg-brand-500 text-white border-brand-500 shadow-glow hover:shadow-glow-hover hover:bg-brand-500/95 active:translate-y-[1px]",
    secondary:
      "bg-surface text-ink-100 border-border hover:bg-surfaceHighlight hover:border-brand-500/30 active:bg-surfaceHighlight/90 active:translate-y-[1px]",
    ghost:
      "bg-transparent text-ink-400 border-transparent hover:text-brand-500 hover:bg-white/5 active:bg-white/10 active:translate-y-[1px]",
    outline:
      "bg-transparent border border-brand-500/35 text-brand-500 hover:bg-brand-500/10 hover:border-brand-500 active:bg-brand-500/15 active:translate-y-[1px]",
    danger:
      "bg-red-500/10 text-red-500 border-red-500/25 hover:bg-red-500/20 hover:border-red-500/60 active:bg-red-500/25 active:translate-y-[1px]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${isLoading ? "opacity-70 cursor-wait" : ""}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === "primary" && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite]" />
      )}
    </motion.button>
  );
};
