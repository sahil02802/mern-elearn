import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({ children, className = '', hover = false, ...props }) => {
    return (
        <motion.div
            initial={hover ? { y: 0 } : false}
            whileHover={hover ? { y: -5, boxShadow: "0 20px 40px -15px rgba(99, 102, 241, 0.2)" } : false}
            className={`relative glass rounded-2xl p-6 ${className}`}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};
