import React from 'react'
import { Sparkles } from 'lucide-react'
import { InstallExtensionButton } from './InstallExtensionButton'

interface PageCtaBannerProps {
  badge: string
  title: string
  description: string
  chromeLabel: string
  edgeLabel: string
  secondaryAction: React.ReactNode
}

export const PageCtaBanner: React.FC<PageCtaBannerProps> = ({
  badge,
  title,
  description,
  chromeLabel,
  edgeLabel,
  secondaryAction,
}) => (
  <section className="w-full py-12 sm:py-16 bg-gradient-to-br from-primary via-primary-container to-secondary text-on-primary relative overflow-hidden">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5">
      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-on-primary/10 text-on-primary font-code-label text-[11px] backdrop-blur-md">
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span>{badge}</span>
      </span>
      <h2 className="font-display-hero text-2xl sm:text-4xl font-bold tracking-tight text-on-primary">
        {title}
      </h2>
      <p className="font-body-md sm:font-body-lg text-sm sm:text-base text-on-primary/90 max-w-2xl mx-auto leading-relaxed">
        {description}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
        <InstallExtensionButton
          variant="inverted"
          chromeLabel={chromeLabel}
          edgeLabel={edgeLabel}
        />
        {secondaryAction}
      </div>
    </div>
  </section>
)
