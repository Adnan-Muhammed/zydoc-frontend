'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent' | 'success';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-95";
    
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg",
        secondary: "bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400",
        danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm",
        success: "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500 shadow-sm",
        accent: "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500 shadow-sm",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-300",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm rounded-md",
        md: "px-5 py-2.5 text-base rounded-lg",
        lg: "px-8 py-4 text-lg rounded-xl",
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : null}
            
            {!isLoading && icon && iconPosition === 'left' && (
                <span className="mr-2 inline-flex">{icon}</span>
            )}
            
            <span>{children}</span>
            
            {!isLoading && icon && iconPosition === 'right' && (
                <span className="ml-2 inline-flex">{icon}</span>
            )}
        </button>
    );
};

export default Button;
