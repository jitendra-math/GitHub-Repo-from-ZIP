import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Loader2, Check } from 'lucide-react'

export default function SearchableSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Search...',
  isLoading = false,
  error = '',
  className = '',
  onFocus,
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredOptions, setFilteredOptions] = useState([])
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  // Filter options based on search term
  useEffect(() => {
    if (options.length > 0) {
      const filtered = options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOptions(filtered)
    } else {
      setFilteredOptions([])
    }
  }, [searchTerm, options])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update search term when value changes externally
  useEffect(() => {
    if (value && options.length > 0) {
      const selected = options.find(opt => opt.value === value)
      if (selected) {
        setSearchTerm(selected.label)
      }
    } else if (!value) {
      setSearchTerm('')
    }
  }, [value, options])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    setIsOpen(true)
    
    // Check if exact match exists
    const exactMatch = options.find(opt => opt.label === newValue || opt.value === newValue)
    if (exactMatch) {
      onChange(exactMatch.value)
    } else {
      onChange('') // Clear selection if no match
    }
  }

  const handleOptionSelect = (selectedValue) => {
    const selected = options.find(opt => opt.value === selectedValue)
    if (selected) {
      setSearchTerm(selected.label)
      onChange(selectedValue)
    }
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleInputFocus = (e) => {
    setIsOpen(true)
    if (onFocus) onFocus(e)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div className={`w-full flex flex-col mb-4 ${className}`} ref={wrapperRef}>
      {label && (
        <label className="text-sm text-textSecondary mb-2 ml-1 font-medium">
          {label} {required && <span className="text-primary">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? 'Loading...' : placeholder}
            disabled={isLoading}
            className={`
              w-full bg-black border rounded-2xl px-4 py-4 text-white 
              placeholder:text-textSecondary/50 
              focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary 
              transition-all duration-200
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border'}
              ${isLoading ? 'opacity-70 cursor-wait' : ''}
              pr-12
            `}
          />
          
          {/* Loading or Dropdown Icon */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <ChevronDown className={`w-5 h-5 text-textSecondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            )}
          </div>
        </div>

        {/* Dropdown Options */}
        {isOpen && !isLoading && (
          <div className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-2xl shadow-glass max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  className={`
                    w-full px-4 py-3 text-left text-sm text-textPrimary
                    hover:bg-surfaceHighlight transition-colors
                    flex items-center justify-between
                    ${option.value === value ? 'bg-primary/10' : ''}
                    border-b border-border/30 last:border-0
                  `}
                >
                  <span>{option.label}</span>
                  {option.value === value && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-textSecondary text-sm">
                {searchTerm ? 'No matching repositories found' : 'No repositories available'}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <span className="text-xs text-red-500 mt-1 ml-1">{error}</span>
      )}
    </div>
  )
}