import React from 'react'

export const AmbientGlow: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Top-center botanical mint aura */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[820px] h-[380px] rounded-full bg-gradient-to-tr from-secondary-fixed/30 via-primary-fixed/25 to-tertiary-fixed/15 blur-3xl" />
      {/* Left soft emerald orb */}
      <div className="absolute top-40 -left-32 w-80 h-80 rounded-full bg-primary-container/10 blur-3xl" />
      {/* Right soft sage-teal orb */}
      <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-secondary-fixed/20 blur-3xl" />
    </div>
  )
}
