import React from 'react'

export const AmbientGlow: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px]" />
      <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-secondary/10 rounded-full blur-[150px]" />
      <div className="absolute -bottom-20 left-1/3 w-[700px] h-[700px] bg-surface-container/50 rounded-full blur-[120px]" />
    </div>
  )
}

