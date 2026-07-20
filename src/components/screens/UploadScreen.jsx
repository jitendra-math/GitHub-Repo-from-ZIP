import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud, FileArchive, FolderGit2, X, GitBranch, Github } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function UploadScreen({
  // Repo name (for new repo)
  repoName,
  setRepoName,
  // Existing repo branch upload fields
  uploadMode,        // 'new' or 'existing'
  setUploadMode,
  existingRepoFullName,
  setExistingRepoFullName,
  branchName,
  setBranchName,
  // ZIP file and extracted files
  zipFile,
  extractedFiles,
  onFileUpload,
  onResetUpload,
  // Navigation
  onContinue,        // goes to preview screen
  onClearToken
}) {
  const fileInputRef = useRef(null)

  // Screen transition animation
  const screenVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  // Repository name mein space ko hyphen mein badalna
  const handleRepoNameChange = (e) => {
    setRepoName(e.target.value.replace(/\s+/g, '-'))
  }

  // Existing repo full name validation hint
  const handleExistingRepoChange = (e) => {
    let value = e.target.value.trim()
    // Auto-remove spaces and convert to lowercase
    value = value.replace(/\s+/g, '').toLowerCase()
    setExistingRepoFullName(value)
  }

  const handleBranchNameChange = (e) => {
    let value = e.target.value.trim()
    // Replace spaces with hyphens, no special chars
    value = value.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_.]/g, '')
    setBranchName(value)
  }

  // Validation for continue button
  const isContinueDisabled = () => {
    if (!zipFile) return true
    if (uploadMode === 'new') {
      return !repoName
    } else {
      return !existingRepoFullName || !branchName
    }
  }

  return (
    <motion.div
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-6 h-full flex flex-col w-full"
    >
      {/* Header section */}
      <div className="flex justify-between items-center mb-6 mt-4">
        <h2 className="text-2xl font-bold tracking-tight">Upload Project</h2>
        <button
          onClick={onClearToken}
          className="text-red-500 text-xs font-medium bg-red-500/10 px-4 py-2 rounded-full active:scale-95 transition-transform"
        >
          Clear Token
        </button>
      </div>

      {/* Toggle between New Repo and Existing Repo */}
      <div className="bg-surfaceHighlight/40 rounded-2xl p-1.5 flex mb-6">
        <button
          onClick={() => setUploadMode('new')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            uploadMode === 'new'
              ? 'bg-primary text-white shadow-md'
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          New Repository
        </button>
        <button
          onClick={() => setUploadMode('existing')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            uploadMode === 'existing'
              ? 'bg-primary text-white shadow-md'
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          Existing Repo + Branch
        </button>
      </div>

      {/* Conditional Inputs based on mode */}
      {uploadMode === 'new' ? (
        <Input
          label="Repository Name"
          placeholder="e.g. my-awesome-project"
          value={repoName}
          onChange={handleRepoNameChange}
        />
      ) : (
        <>
          <Input
            label="Existing Repository (owner/repo)"
            placeholder="e.g. johndoe/my-existing-project"
            value={existingRepoFullName}
            onChange={handleExistingRepoChange}
          />
          <Input
            label="New Branch Name"
            placeholder="zip-upload"
            value={branchName}
            onChange={handleBranchNameChange}
          />
          <p className="text-xs text-textSecondary mt- -mt-2 ml-1 mb-2">
            ⚠️ Branch will be created if missing, and its content will be <strong>fully replaced</strong> with your ZIP.
          </p>
        </>
      )}

      {/* File Upload Area */}
      <div className="flex-1 flex flex-col mt-2">
        <label className="text-sm text-textSecondary mb-2 font-medium ml-1">
          Upload Project (.zip)
        </label>

        {!zipFile ? (
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-surfaceHighlight/30 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-textSecondary cursor-pointer hover:bg-surfaceHighlight/50 transition-colors"
          >
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 shadow-glass">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            <p className="font-semibold text-textPrimary">Tap to select .zip</p>
            <p className="text-xs mt-2 opacity-70">Folder upload workaround</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 bg-surfaceHighlight border border-border rounded-2xl p-5 flex flex-col shadow-lg"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <FileArchive className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-textPrimary truncate max-w-[180px]">
                    {zipFile.name}
                  </p>
                  <p className="text-xs text-textSecondary mt-0.5">
                    {extractedFiles.length} files detected
                  </p>
                </div>
              </div>
              <button
                onClick={onResetUpload}
                className="p-2 bg-black/40 rounded-full text-textSecondary hover:text-white active:scale-90 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tree Preview */}
            <div className="bg-black/60 rounded-xl p-4 flex-1 overflow-hidden relative border border-white/5">
              <p className="text-xs text-textSecondary mb-3 font-medium tracking-wide uppercase">
                Tree Preview
              </p>
              <div className="space-y-2.5">
                {extractedFiles.slice(0, 5).map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
                    <p className="text-xs text-textPrimary truncate opacity-90">
                      {file.path}
                    </p>
                  </div>
                ))}
                {extractedFiles.length > 5 && (
                  <div className="pt-2 mt-2 border-t border-border/50">
                    <p className="text-xs text-textSecondary italic">
                      + {extractedFiles.length - 5} more files & folders...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Hidden file input */}
        <input
          type="file"
          accept=".zip"
          ref={fileInputRef}
          onChange={onFileUpload}
          className="hidden"
        />
      </div>

      {/* Action Button */}
      <div className="mt-6">
        <Button
          onClick={onContinue}
          disabled={isContinueDisabled()}
        >
          <FolderGit2 className="w-5 h-5" />
          {uploadMode === 'new' ? 'Review New Repo' : 'Review Branch Upload'}
        </Button>
      </div>
    </motion.div>
  )
}