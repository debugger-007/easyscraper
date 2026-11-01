import React from 'react'

export const AmbientGlow: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-40 left-1/4 w-[650px] h-[650px] rounded-full [background:radial-gradient(circle,rgba(99,102,241,0.15)_0%,rgba(99,102,241,0.05)_40%,transparent_70%)]" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full [background:radial-gradient(circle,rgba(6,182,212,0.12)_0%,rgba(6,182,212,0.04)_40%,transparent_70%)]" />
      <div className="absolute -bottom-20 left-1/3 w-[750px] h-[750px] rounded-full [background:radial-gradient(circle,rgba(31,31,39,0.7)_0%,rgba(31,31,39,0.2)_40%,transparent_70%)]" />
    </div>
  )
}
