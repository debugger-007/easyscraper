import React from 'react'
import { useDetectedBrowser } from '../utils/browserDetector'
import { BrowserStoreIcon } from './icons/BrowserIcons'

interface InstallExtensionButtonProps {
  chromeLabel: string
  edgeLabel: string
  variant?: 'primary' | 'inverted'
  className?: string
}

export const InstallExtensionButton: React.FC<InstallExtensionButtonProps> = ({
  chromeLabel,
  edgeLabel,
  variant = 'primary',
  className,
}) => {
  const { isEdge, browser, storeUrl } = useDetectedBrowser()

  const baseStyles =
    variant === 'inverted'
      ? 'w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl sm:rounded-full bg-surface-container-lowest hover:bg-surface text-primary font-bold text-sm sm:text-base shadow-lg transition-all transform sm:hover:-translate-y-0.5 active:scale-[0.98]'
      : 'w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-full bg-primary text-on-primary font-semibold text-sm sm:text-base hover:bg-primary-container shadow-[0_8px_24px_rgba(0,105,72,0.24)] transition-all transform sm:hover:-translate-y-0.5 active:scale-[0.98]'

  return (
    <a
      href={storeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className ? `${baseStyles} ${className}` : baseStyles}
    >
      <BrowserStoreIcon browser={browser} className="w-5 h-5 shrink-0" />
      <span>{isEdge ? edgeLabel : chromeLabel}</span>
    </a>
  )
}
