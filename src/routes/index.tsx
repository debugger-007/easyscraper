import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold font-headline-md text-primary">EasyScraper Pro</h1>
    </div>
  )
}
