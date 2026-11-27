import { createFileRoute } from '@tanstack/react-router'
import { ComparePage } from '../components/ComparePage'
import { buildCompareSeoHead } from '../config/seo'

export const Route = createFileRoute('/compare')({
  head: () => buildCompareSeoHead('en'),
  component: () => <ComparePage currentLocale="en" />,
})
