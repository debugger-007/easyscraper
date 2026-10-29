import React from 'react'

interface PrismLogoProps {
  className?: string
  size?: number
}

export const PrismLogo: React.FC<PrismLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-lg overflow-hidden border border-secondary/30 group-hover:border-secondary transition-colors ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-1 drop-shadow-[0_0_8px_rgba(76,215,246,0.5)]"
      >
        <defs>
          <linearGradient id="prism-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4cd7f6" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#c0c1ff" />
          </linearGradient>
          <linearGradient id="prism-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#03b5d3" />
            <stop offset="100%" stopColor="#1000a9" />
          </linearGradient>
          <radialGradient id="prism-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#acedff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4cd7f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient glow behind prism */}
        <circle cx="24" cy="24" r="18" fill="url(#prism-glow)" opacity="0.3" />

        {/* Outer Prism Facets */}
        <path
          d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
          stroke="url(#prism-grad-1)"
          strokeWidth="2"
          fill="#13131b"
          fillOpacity="0.85"
        />

        {/* Inner Kinetic Geometries */}
        <path
          d="M24 4L24 44M24 24L42 14M24 24L6 14M24 24L42 34M24 24L6 34"
          stroke="url(#prism-grad-2)"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />

        {/* High-tech central core */}
        <polygon
          points="24,14 33,24 24,34 15,24"
          fill="url(#prism-grad-1)"
          fillOpacity="0.8"
        />
        <circle cx="24" cy="24" r="2.5" fill="#ffffff" />
      </svg>
    </div>
  )
}

