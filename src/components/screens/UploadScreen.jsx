import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud, FileArchive, FolderGit2, X, GitBranch } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import SearchableSelect from '../ui/SearchableSelect'
import { fetchUserRepos, fetchRepoBranches } from '../../utils/githubApi'

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
  const token = localStorage.getItem('gh_mobile_token') || ''

  // --- New states for dropdowns ---
  const [repoOptions, setRepoOptions] = useState([])
  const [branchOptions, setBranchOptions] = useState([])
  const [isReposLoading, setIsReposLoading] = useState(false)
  const [isBranchesLoading, setIsBranchesLoading] = useState(false)
  const [repoError, setRepoError] = useState('')
  const [branchError, setBranchError] = useState('')

  // --- Screen transition animation ---
  const screenVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  // --- Effect 1: Fetch repos when switching to "existing" mode ---
  useEffect(() => {
    if (uploadMode === 'existing' && token) {
      loadUserRepos()
    } else {
      // Reset repo options when switching to new mode
      setRepoOptions([])
      setRepoError('')
    }
  }, [uploadMode, token])

  // --- Effect 2: Fetch branches when repo is selected ---
  useEffect(() => {
    if (uploadMode === 'existing' && existingRepoFullName && existingRepoFullName.includes('/')) {
      loadRepoBranches(existingRepoFullName)
    } else {
      setBranchOptions([])
      setBranchError('')
    }
  }, [existingRepoFullName, uploadMode])

  // --- Effect 3: Auto-suggest repo name from ZIP file (New mode) ---
  useEffect(() => {
    if (uploadMode === 'new' && zipFile) {
      const suggestedName = zipFile.name
        .replace(/\.zip$/i, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
      if (suggestedName) {
        setRepoName(suggestedName)
      }
    }
  }, [zipFile, uploadMode, setRepoName])

  // --- Handlers for fetching data ---
  const loadUserRepos = async () => {
    setIsReposLoading(true)
    setRepoError('')
    try {
      const repos = await fetchUserRepos(token)
      const options = repos.map(repo => ({
        label: `${repo.full_name} ${repo.private ? '🔒' : '🔓'}`,
        value: repo.full_name,
        default_branch: repo.default_branch
      }))
      setRepoOptions(options)
      
      // If we have a previously selected repo, verify it still exists
      if (existingRepoFullName) {
        const stillExists = options.some(opt => opt.value === existingRepoFullName)
        if (!stillExists) {
          setExistingRepoFullName('')
        }
      }
    } catch (error) {
      setRepoError(error.message)
      console.error('Failed to load repos:', error)
    } finally {
      setIsReposLoading(false)
    }
  }

  const loadRepoBranches = async (repoFullName) => {
    const [owner, repo] = repoFullName.split('/')
    if (!owner || !repo) return

    setIsBranchesLoading(true)
    setBranchError('')
    try {
      const branches = await fetchRepoBranches(token, owner, repo)
      const options = branches.map(branch => ({
        label: branch.default ? `${branch.name} ⭐ (default)` : branch.name,
        value: branch.name
      }))
      setBranchOptions(options)
      
      // Auto-select the default branch
      const defaultBranch = branches.find(b => b.default)
      if (defaultBranch) {
        setBranchName(defaultBranch.name)
      } else if (branches.length > 0) {
        setBranchName(branches[0].name)
      }
    } catch (error) {
      setBranchError(error.message)
      console.error('Failed to load branches:', error)
      // Don't clear branch options on error - keep whatever we had
    } finally {
      setIsBranchesLoading(false)
    }
  }

  // --- Input handlers ---
  const handleRepoNameChange = (e) => {
    setRepoName(e.target.value.replace(/\s+/g, '-'))
  }

  const handleBranchNameChange = (e) => {
    let value = e.target.value.trim()
    value = value.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_.]/g, '')
    setBranchName(value)
  }

  // --- Validation for continue button ---
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
          hint={zipFile ? `📦 Suggested from: ${zipFile.name}` : ''}
        />
      ) : (
        <>
          <SearchableSelect
            label="Select Repository"
            placeholder="Search your repositories..."
            value={existingRepoFullName}
            onChange={setExistingRepoFullName}
            options={repoOptions}
            isLoading={isReposLoading}
            error={repoError}
            onFocus={() => {
              if (repoOptions.length === 0 && !isReposLoading) {
                loadUserRepos()
              }
            }}
            required
          />
          
          <SearchableSelect
            label="Select Branch"
            placeholder={isBranchesLoading ? "Loading branches..." : "Select a branch"}
            value={branchName}
            onChange={setBranchName}
            options={branchOptions}
            isLoading={isBranchesLoading}
            error={branchError}
            required
          />
          
          <p className="text-xs text-textSecondary -mt-2 ml-1 mb-2">
            ⚠️ Branch content will be <strong>fully replaced</strong> with your ZIP.
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