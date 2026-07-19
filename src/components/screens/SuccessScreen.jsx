import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, ExternalLink, RefreshCw, Github } from 'lucide-react'
import Button from '../ui/Button'

export default function SuccessScreen({ repoUrl, onDone }) {
  const screenVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 }
  }

  const handleOpenRepo = () => {
    window.open(repoUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.div
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-6 h-full flex flex-col justify-center items-center text-center w-full"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
        className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-7 relative"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-25"></div>
        <CheckCircle2 className="w-12 h-12 text-primary relative z-10" />
      </motion.div>

      <h2 className="text-2xl font-semibold mb-2 tracking-tight">All Done!</h2>
      <p className="text-textSecondary text-sm mb-9 px-5 leading-relaxed">
        Your project is now live on GitHub. No terminal, no hassle.
      </p>

      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full bg-surface border border-border/20 p-3.5 rounded-xl mb-7 flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <Github className="w-4 h-4 text-textSecondary flex-shrink-0" />
          <span className="text-[11px] font-mono text-primary/90 truncate">
            {repoUrl.replace('https://', '')}
          </span>
        </div>
        <button 
          onClick={handleOpenRepo}
          className="p-1.5 bg-primary/10 rounded-lg text-primary active:scale-95 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </motion.div>

      <div className="w-full flex flex-col gap-2.5">
        <Button onClick={handleOpenRepo}>
          Open Repository
        </Button>
        <Button variant="secondary" onClick={onDone}>
          <RefreshCw className="w-4 h-4" />
          Upload Another
        </Button>
      </div>

      <p className="mt-7 text-[10px] text-textSecondary/30 uppercase tracking-widest font-medium">
        Built by Jitu Banna • JSS Originals
      </p>
    </motion.div>
  )
}