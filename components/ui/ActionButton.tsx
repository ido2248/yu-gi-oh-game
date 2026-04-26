'use client';
import { motion } from 'framer-motion';

interface Props {
  id?: string;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  highlighted?: boolean;
  disabled?: boolean;
  className?: string;
}

const variants = {
  primary:   'bg-blue-700 hover:bg-blue-600 border-blue-500 text-white',
  secondary: 'bg-gray-700 hover:bg-gray-600 border-gray-500 text-white',
  danger:    'bg-red-800 hover:bg-red-700 border-red-600 text-white',
  success:   'bg-emerald-700 hover:bg-emerald-600 border-emerald-500 text-white',
};

export default function ActionButton({ id, label, onClick, variant = 'primary', highlighted = false, disabled = false, className = '' }: Props) {
  return (
    <motion.button
      id={id}
      data-zone={id}
      className={`
        px-3 py-1.5 rounded-md border text-xs font-semibold
        transition-colors duration-150 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]}
        ${highlighted ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-gray-950 zone-glow' : ''}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.04 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
    >
      {label}
    </motion.button>
  );
}
