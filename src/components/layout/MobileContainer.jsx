import React from 'react'

export default function MobileContainer({ children }) {
  return (
    <div className="min-h-screen bg-background flex justify-center w-full selection:bg-primary/30">
      <div className="w-full max-w-md bg-surface h-[100dvh] relative overflow-y-auto overflow-x-hidden shadow-soft border-x border-border/10 flex flex-col">
        {children}
      </div>
    </div>
  )
}