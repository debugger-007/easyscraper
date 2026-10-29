import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$lang')({
  component: LangComponent,
})

function LangComponent() {
  const { lang } = Route.useParams()
  return (
    <div className="p-8">
      <h1>Language: {lang}</h1>
    </div>
  )
}
