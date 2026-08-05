import { createFileRoute, Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_auth/login")({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-8 px-6">
      <header className="flex flex-col gap-2">
        <span className="inline-block w-fit rounded-full bg-brand-yellow px-3 py-1 text-xs font-semibold tracking-[0.5px] text-brand-yellow-foreground uppercase">
          INC Inventaris
        </span>
        <h1 className="text-3xl font-medium tracking-[-0.5px] text-foreground">
          Masuk ke akun
        </h1>
        <p className="text-base text-muted-foreground">
          Silakan gunakan kredensial General Affairs Anda.
        </p>
      </header>

      <form className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Email</span>
          <input
            type="email"
            placeholder="anda@inc.co.id"
            className="h-11 rounded-md border border-hairline-strong bg-background px-4 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Kata sandi</span>
          <input
            type="password"
            placeholder="••••••••"
            className="h-11 rounded-md border border-hairline-strong bg-background px-4 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30"
          />
        </label>

        <Button className="mt-2 w-full" type="submit">
          Masuk
        </Button>
        <Button variant="link" className="mx-auto" render={<Link to="/" />}>
          Lanjut sebagai tamu
        </Button>
      </form>
    </div>
  )
}
