import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud, FileArchive, FolderGit2, X, GitBranch } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function UploadScreen({
  repoName,
  setRepoName,
  uploadMode,
  setUploadMode,
  existingRepoFullName,
  setExistingRepoFullName,
  branchName,
  setBranchName,
  zipFile,
  extractedFiles,
  onFileUpload,
  onResetUpload,
  onContinue,
  onClearToken
}) {
  const fileInputRef = useRef(null)

  const screenVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  const handleRepoNameChange = (e) => {
    setRepoName(e.target.value.replace(/\s+/g, '-'))
  }

  const handleExistingRepoChange = (e) => {
    let value = e.target.value.trim()
    value = value.replace(/\s+/g, '').toLowerCase()
    setExistingRepoFullName(value)
  }

  const handleBranchNameChange = (e) => {
    let value = e.target.value.trim()
    value = value.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_.]/g, '')
    setBranchName(value)
  }

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
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold tracking-tight">Upload Project</h2>
        <button
          onClick={onClearToken}
          className="text-xs font-medium text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full active:scale-95 transition-transform"
        >
          Clear Token
        </button>
      </div>

      <div className="bg-background rounded-xl p-1 flex mb-5">
        <button
          onClick={() => setUploadMode('new')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            uploadMode === 'new'
              ? 'bg-primary text-white shadow-sm'
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          New Repo
        </button>
        <button
          onClick={() => setUploadMode('existing')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            uploadMode === 'existing'
              ? 'bg-primary text-white shadow-sm'
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          Existing
        </button>
      </div>

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
            label="Repository (owner/repo)"
            placeholder="johndoe/my-project"
            value={existingRepoFullName}
            onChange={handleExistingRepoChange}
          />
          <Input
            label="Branch Name"
            placeholder="zip-upload"
            value={branchName}
            onChange={handleBranchNameChange}
          />
          <p className="text-xs text-textSecondary/70 -mt-1 mb-3 ml-1">
            ⚠️ Branch content will be <span className="font-semibold">fully replaced</span> with your ZIP.
          </p>
        </>
      )}

      <div className="flex-1 flex flex-col">
        <label className="text-sm text-textSecondary font-medium mb-2 ml-1">
          Upload Project (.zip)
        </label>

        {!zipFile ? (
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-surface/30 border-2 border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center text-textSecondary cursor-pointer hover:bg-surface/50 transition-colors"
          >
            <div className="w-14 h-14 bg-surface rounded-full flex items-center justify-center mb-3 shadow-soft">
              <UploadCloud className="w-7 h-7 text-primary" />
            </div>
            <p className="font-medium text-textPrimary text-sm">Tap to select .zip</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 bg-surface border border-border/20 rounded-xl p-4 flex flex-col shadow-soft"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/20 rounded-lg">
                  <FileArchive className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm text-textPrimary truncate max-w-[150px]">
                    {zipFile.name}
                  </p>
                  <p className="text-xs text-textSecondary">
                    {extractedFiles.length} files
                  </p>
                </div>
              </div>
              <button
                onClick={onResetUpload}
                className="p-1.5 bg-background/40 rounded-full text-textSecondary hover:text-textPrimary active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-background/50 rounded-lg p-3 flex-1 overflow-hidden border border-border/10">
              <p className="text-[10px] uppercase tracking-wider text-textSecondary/60 font-semibold mb-2">
                File Preview
              </p>
              <div className="space-y-2">
                {extractedFiles.slice(0, 5).map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="w-1 h-1 rounded-full bg-primary/60"></div>
                    <p className="text-[11px] font-mono text-textPrimary/80 truncate">
                      {file.path}
                    </p>
                  </div>
                ))}
                {extractedFiles.length > 5 && (
                  <div className="pt-1 mt-1 border-t border-border/20">
                    <p className="text-[10px] text-textSecondary/50 italic">
                      + {extractedFiles.length - 5} more
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <input
          type="file"
          accept=".zip"
          ref={fileInputRef}
          onChange={onFileUpload}
          className="hidden"
        />
      </div>

      <div className="mt-5">
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