import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function Button({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  disabled, 
  ...props 
}) {
  // Refined base: smaller padding, clean rounding, premium feel
  const baseStyles = "w-full flex items-center justify-center gap-2 font-semibold rounded-xl py-3 px-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
  
  const variants = {
    primary: "bg-primary text-white hover:bg-[#8f6a7a] active:bg-[#7a5a68]",
    secondary: "bg-surface text-textPrimary border border-border/30 hover:border-border/60",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
    ghost: "bg-transparent text-textSecondary hover:text-textPrimary"
  }

  return (
    <motion.button
      whileTap={disabled || isLoading ? {} : { scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  )
}