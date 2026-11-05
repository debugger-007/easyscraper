import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/$lang')({
  component: LangLayoutComponent,
})

function LangLayoutComponent() {
  return <Outlet />
}
