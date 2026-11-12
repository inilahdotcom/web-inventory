import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { Toaster } from "sonner"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

function RootErrorComponent({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#f7f8fa] p-4 text-[#1c1c1e]">
      <div className="flex max-w-md flex-col items-center rounded-2xl border border-[#eef0f3] bg-white p-8 text-center shadow-xs">
        <div className="grid size-12 place-items-center rounded-full bg-rose-100 text-rose-600">
          <AlertTriangle size={24} />
        </div>

        <h1 className="mt-4 text-lg font-bold">Terjadi Kesalahan Sistem</h1>

        <p className="mt-2 text-xs leading-relaxed text-[#6b6f7e]">
          Aplikasi mengalami kendala yang tidak terduga saat memuat halaman ini.
          Silakan muat ulang halaman atau hubungi tim pengembang jika masalah
          berlanjut.
        </p>

        {import.meta.env.DEV && (
          <pre className="mt-4 max-h-32 w-full overflow-auto rounded-lg bg-neutral-100 p-2 text-left font-mono text-[11px] text-rose-700">
            {error.message || String(error)}
          </pre>
        )}

        <Button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 gap-2 bg-[#1c1c1e] text-white hover:bg-[#2c2c2e]"
        >
          <RefreshCw size={14} />
          <span>Muat Ulang Halaman</span>
        </Button>
      </div>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: RootErrorComponent,
})

function RootLayout() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton />

      <Outlet />

      {import.meta.env.DEV ? (
        <TanStackRouterDevtools position="bottom-right" />
      ) : null}
    </>
  )
}
