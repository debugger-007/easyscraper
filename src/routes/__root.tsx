import { Outlet, createRootRoute } from '@tanstack/react-router'
import { AmbientGlow } from '../components/AmbientGlow'
import '../styles.css'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="relative min-h-screen bg-surface text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container">
      <AmbientGlow />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Outlet />
      </div>
    </div>
  )
}
