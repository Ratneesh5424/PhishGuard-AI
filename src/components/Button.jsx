import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  }[size] || 'px-5 py-2.5 text-sm gap-2';

  const variantStyles = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_4px_20px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_25px_rgba(99,102,241,0.5)] border border-indigo-400/30',
    gradient:
      'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 text-white shadow-[0_4px_25px_rgba(37,99,235,0.45)] hover:shadow-[0_6px_30px_rgba(6,182,212,0.55)] border border-cyan-400/30 font-semibold',
    secondary:
      'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white border border-slate-700 shadow-sm',
    outline:
      'border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-white bg-slate-900/40 hover:bg-slate-850',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_4px_20px_rgba(244,63,94,0.35)]',
  }[variant] || 'bg-indigo-600 text-white';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      {children}
    </motion.button>
  );
};

export default Button;
