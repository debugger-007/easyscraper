import { Outlet, createRootRoute, HeadContent } from '@tanstack/react-router'
import { AmbientGlow } from '../components/AmbientGlow'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#13131b' },
      { name: 'robots', content: 'index, follow' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <HeadContent />
      <div className="relative min-h-screen bg-surface text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container">
        <AmbientGlow />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Outlet />
        </div>
      </div>
    </>
  )
}
