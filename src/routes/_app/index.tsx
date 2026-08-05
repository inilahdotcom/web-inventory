import { createFileRoute } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_app/")({
  component: DashboardPage,
})

const stats = [
  { label: "Total aset", value: "95", tint: "bg-brand-yellow" },
  { label: "Bagus", value: "72", tint: "bg-[#c3faf5] text-[#187574]" },
  { label: "Rusak ringan", value: "14", tint: "bg-[#fff8e0] text-[#746019]" },
  { label: "Rusak berat", value: "9", tint: "bg-[#ffc6c6] text-[#600000]" },
] as const

function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold tracking-[0.5px] text-muted-foreground uppercase">
            Overview
          </p>
          <h1 className="text-3xl font-medium tracking-[-0.5px]">Dashboard</h1>
          <p className="text-base text-muted-foreground">
            Ringkasan aset PT. Indonesia News Center — General Affairs.
          </p>
        </div>
        <Button variant="yellow">Tambah aset</Button>
      </header>

      <section className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl px-5 py-6 ${s.tint} text-foreground`}
          >
            <div className="text-sm font-medium opacity-80">{s.label}</div>
            <div className="mt-3 text-4xl font-medium tracking-[-0.5px]">
              {s.value}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-hairline bg-background p-6">
        <h2 className="text-lg font-medium">Aktivitas terbaru</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Placeholder — sambungkan dengan tabel transaksi saat implementasi.
        </p>
      </section>
    </div>
  )
}
