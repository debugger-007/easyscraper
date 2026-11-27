import { createFileRoute } from '@tanstack/react-router'
import { FaqPage } from '../components/FaqPage'
import { buildFaqSeoHead } from '../config/seo'

export const Route = createFileRoute('/faq')({
  head: () => buildFaqSeoHead('en'),
  component: () => <FaqPage currentLocale="en" />,
})
