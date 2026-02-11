'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helper?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helper, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`
            w-full bg-background-secondary text-text-primary
            border rounded-xl px-4 py-3
            focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
            placeholder:text-text-muted transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-card-border'}
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-red-400">{error}</p>
                )}
                {helper && !error && (
                    <p className="mt-1.5 text-sm text-text-muted">{helper}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
