import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, FolderGit2, FileCode, PackageOpen, GitBranch } from 'lucide-react'
import Button from '../ui/Button'

export default function PreviewScreen({ 
  uploadMode,
  repoName,
  existingRepoFullName,
  branchName,
  extractedFiles, 
  onConfirm, 
  onBack 
}) {
  const screenVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  }

  const targetTitle = uploadMode === 'new' ? 'New Repository' : 'Existing + Branch'
  const targetValue = uploadMode === 'new' 
    ? repoName 
    : `${existingRepoFullName} / ${branchName}`

  return (
    <motion.div
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-6 h-full flex flex-col w-full"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 mt-4">
        <button 
          onClick={onBack}
          className="p-2 bg-surface rounded-full text-textPrimary active:scale-95 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold tracking-tight">Review Tree</h2>
      </div>

      {/* Target Info Card */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-3.5 mb-5 flex items-center gap-3.5">
        <div className="w-9 h-9 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
          {uploadMode === 'new' ? (
            <PackageOpen className="w-5 h-5 text-primary" />
          ) : (
            <GitBranch className="w-5 h-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">
            {targetTitle}
          </p>
          <p className="text-base font-semibold text-textPrimary truncate">
            {targetValue}
          </p>
          {uploadMode === 'existing' && (
            <p className="text-[11px] text-textSecondary/70 mt-0.5">
              ⚠️ Branch content will be <span className="font-medium">fully replaced</span>
            </p>
          )}
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-2.5 ml-0.5">
          <p className="text-sm text-textSecondary font-medium">Files to push</p>
          <span className="text-[11px] bg-surface px-2 py-0.5 rounded-md text-textSecondary">
            {extractedFiles.length}
          </span>
        </div>

        <div className="flex-1 bg-background/50 border border-border/10 rounded-xl overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
            {extractedFiles.map((file, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.025 }}
                className="flex items-center gap-2.5"
              >
                <FileCode className="w-3.5 h-3.5 text-primary/50 flex-shrink-0" />
                <p className="text-[11px] font-mono text-textPrimary/80 truncate">
                  {file.path}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-5">
        <Button onClick={onConfirm}>
          <FolderGit2 className="w-5 h-5" />
          {uploadMode === 'new' ? 'Create Repo & Push' : 'Push to Branch'}
        </Button>
      </div>

      <p className="text-[10px] text-center text-textSecondary/40 mt-3.5 uppercase tracking-wide font-medium">
        Final check before commit
      </p>
    </motion.div>
  )
}