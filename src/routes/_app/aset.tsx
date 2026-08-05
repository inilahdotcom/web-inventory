import { createFileRoute } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_app/aset")({
  component: AsetPage,
})

const rows = [
  { kode: "001/INC-GA/M/25", nama: "MacBook Pro 14", status: "Bagus" },
  {
    kode: "002/INC-GA/M/25",
    nama: "Kursi Ergonomis Herman",
    status: "Rusak Ringan",
  },
  {
    kode: "003/INC-GA/M/25",
    nama: "Proyektor Epson EB-X41",
    status: "Rusak Berat",
  },
] as const

function AsetPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold tracking-[0.5px] text-muted-foreground uppercase">
            Katalog
          </p>
          <h1 className="text-3xl font-medium tracking-[-0.5px]">
            Daftar Aset
          </h1>
          <p className="text-base text-muted-foreground">
            95 aset tercatat. Contoh 3 baris pertama ditampilkan di bawah.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Filter</Button>
          <Button>Tambah aset</Button>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-hairline bg-background">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline text-xs font-semibold tracking-[0.5px] text-muted-foreground uppercase">
            <tr>
              <th className="px-5 py-3">Kode aset</th>
              <th className="px-5 py-3">Nama</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.kode}
                className="border-b border-hairline last:border-0"
              >
                <td className="px-5 py-4 font-mono text-xs">{r.kode}</td>
                <td className="px-5 py-4">{r.nama}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
