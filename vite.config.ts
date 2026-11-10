import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { createLicenseDevMiddleware } from './src/services/license/devServerMiddleware'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      TanStackRouterVite({
        routesDirectory: './src/routes',
        generatedRouteTree: './src/routeTree.gen.ts',
      }),
      tsconfigPaths(),
      viteReact(),
      {
        name: 'license-dev-server-middleware',
        configureServer(server) {
          server.middlewares.use(
            createLicenseDevMiddleware({
              DODO_PAYMENTS_API_KEY: env.DODO_PAYMENTS_API_KEY,
              VITE_PAYMENT_MODE: env.VITE_PAYMENT_MODE,
            })
          )
        },
      },
    ],
  }
})
