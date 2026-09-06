import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createRouter, RouterProvider } from "@tanstack/react-router"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { NotFoundView } from "@/features/not-found/components/NotFoundView"
import { routeTree } from "./routeTree.gen"

const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFoundView,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
)
