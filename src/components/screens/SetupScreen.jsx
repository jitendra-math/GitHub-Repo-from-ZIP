import React from 'react'
import { motion } from 'framer-motion'
import { Github } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function SetupScreen({ token, setToken, onSave }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    if (token.trim().length > 10) {
      onSave(token)
    }
  }

  const screenVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
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
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-6 shadow-soft"
      >
        <Github className="w-8 h-8 text-primary" />
      </motion.div>

      <h1 className="text-xl font-semibold mb-2 tracking-tight">Connect GitHub</h1>
      <p className="text-textSecondary mb-8 text-sm leading-relaxed">
        Paste your Personal Access Token to continue.
      </p>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
        <Input
          type="password"
          placeholder="ghp_xxxxxxxxxxxx..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />
        <Button 
          type="submit" 
          disabled={!token.trim()}
        >
          Save & Continue
        </Button>
      </form>
      
      <div className="mt-8 text-xs text-textSecondary/50 font-medium">
        <p>Your token is safely stored locally on your device.</p>
      </div>
    </motion.div>
  )
}