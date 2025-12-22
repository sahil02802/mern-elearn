import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export function Pagination({ currentPage, totalPages, onPageChange, className = "" }) {


    return (
        <div className={`flex items-center justify-center gap-4 mt-6 pt-4 border-t border-white/5 ${className}`}>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="text-ink-400 hover:text-white"
            >
                <ChevronLeft size={20} />
            </Button>
            <span className="text-sm text-ink-400 font-mono">
                Page {currentPage} of {totalPages}
            </span>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="text-ink-400 hover:text-white"
            >
                <ChevronRight size={20} />
            </Button>
        </div>
    );
}
