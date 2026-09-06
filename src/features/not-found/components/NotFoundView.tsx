import { Link, useRouter } from "@tanstack/react-router"
import { Button, buttonVariants } from "@/components/ui/button"

export function NotFoundView() {
  const router = useRouter()

  return (
    <div className="grid min-h-svh place-items-center bg-background px-4 py-12 text-foreground">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <img
          src="/404.png"
          alt=""
          aria-hidden
          width={400}
          height={394}
          className="w-52 sm:w-64"
        />

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Halaman tidak ditemukan
          </h1>
          <p className="text-sm text-muted-foreground">
            Alamat yang kamu buka tidak tersedia atau sudah dipindahkan. Coba
            periksa kembali URL-nya.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/" className={buttonVariants({ variant: "primary" })}>
            Kembali ke Dashboard
          </Link>
          <Button variant="secondary" onClick={() => router.history.back()}>
            Halaman sebelumnya
          </Button>
        </div>
      </div>
    </div>
  )
}
