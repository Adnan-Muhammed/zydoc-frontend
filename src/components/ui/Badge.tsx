import React from 'react';

const variants = {
    primary: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    secondary: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    info: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
    accent: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

type BadgeProps = {
    children: React.ReactNode;
    variant?: keyof typeof variants;
    pill?: boolean;
    className?: string;
    icon?: React.ReactNode;
};

const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'primary',
    pill = false,
    className = '',
    icon
}) => {
    return (
        <span
            className={`
        inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold
        ${pill ? 'rounded-full' : 'rounded-md'}
        ${variants[variant]}
        ${className}
      `}
        >
            {icon && <span className="inline-flex shrink-0">{icon}</span>}
            {children}
        </span>
    );
};

export default Badge;