import React from 'react';

export const Badge = ({ children, variant = 'primary', className = '' }) => {
    const variants = {
        primary: "bg-brand-500/10 text-brand-400 border-brand-500/20",
        success: "bg-accent-500/10 text-accent-400 border-accent-500/20",
        warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        danger: "bg-red-500/10 text-red-400 border-red-500/20",
        neutral: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
