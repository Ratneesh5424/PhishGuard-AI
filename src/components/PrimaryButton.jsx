import React from 'react';

export const PrimaryButton = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
  icon: Icon,
  variant = 'gradient', // 'gradient' | 'secondary' | 'danger'
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-xs gap-2',
    lg: 'px-6 py-3.5 text-sm gap-2.5 rounded-2xl'
  }[size] || 'px-4 py-2.5 text-xs gap-2';

  const variantStyles = {
    gradient: 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/20 hover:shadow-cyan-500/30 active:scale-[0.98]',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 active:scale-[0.98]',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 active:scale-[0.98]'
  }[variant] || '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

export default PrimaryButton;
