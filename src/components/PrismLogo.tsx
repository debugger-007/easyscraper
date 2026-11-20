import React from 'react'

interface PrismLogoProps {
  className?: string
  size?: number
}

export const PrismLogo: React.FC<PrismLogoProps> = ({ className = '', size = 44 }) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/logo.svg"
        alt="Easy Web Scraper"
        width={size}
        height={size}
        className="w-full h-full object-contain"
        decoding="async"
      />
    </div>
  )
}
