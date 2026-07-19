import React from 'react'
import { motion } from 'framer-motion'
import { Github } from 'lucide-react'
import ProgressBar from '../ui/ProgressBar'

export default function ProcessingScreen({ statusMessage, progress }) {
  const screenVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 }
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
        animate={{
          boxShadow: [
            "0px 0px 0px 0px rgba(166, 123, 139, 0.25)",
            "0px 0px 0px 28px rgba(166, 123, 139, 0)",
            "0px 0px 0px 0px rgba(166, 123, 139, 0)"
          ]
        }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-7 shadow-soft relative"
      >
        <Github className="w-10 h-10 text-primary relative z-10" />
      </motion.div>

      <h2 className="text-xl font-semibold mb-1.5 tracking-tight">Pushing to GitHub</h2>
      <p className="text-textSecondary text-sm mb-10 px-5 leading-relaxed">
        Please keep the app open. We're building your repository and uploading files.
      </p>

      <div className="w-full max-w-[280px]">
        <ProgressBar progress={progress} message={statusMessage} />
      </div>
    </motion.div>
  )
}