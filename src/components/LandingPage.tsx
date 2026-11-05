import React from 'react'
import type { SupportedLocale } from '../locales/types'
import { useTranslate } from '../locales'
import { Navbar } from './Navbar'
import { HeroSection } from './HeroSection'
import { ComplianceMatrix } from './ComplianceMatrix'
import { FeatureGrid } from './FeatureGrid'
import { InteractiveSandbox } from './InteractiveSandbox'
import { PricingSection } from './PricingSection'
import { Footer } from './Footer'

interface LandingPageProps {
  locale?: SupportedLocale
}

export const LandingPage: React.FC<LandingPageProps> = ({ locale: overrideLocale }) => {
  const { t, locale } = useTranslate(overrideLocale)

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar currentLocale={locale} t={t} />
      <main className="flex-1">
        <HeroSection t={t} />
        <FeatureGrid t={t} />
        <InteractiveSandbox t={t} />
        <ComplianceMatrix t={t} />
        <PricingSection t={t} />
      </main>
      <Footer t={t} />
    </div>
  )
}
