import { type ReactNode, useState } from "react"

export function AssetMutationView() {
  const [location, setLocation] = useState("Redaksi Lantai 3")
  const [holder, setHolder] = useState("Aditya Pratama")
  const [date, setDate] = useState("05/08/2026")
  const [reason, setReason] = useState("Kebutuhan liputan tim redaksi")
  const [printReceipt, setPrintReceipt] = useState(true)
  const [notice, setNotice] = useState("")
  const reset = () => {
    setLocation("Redaksi Lantai 3")
    setHolder("Aditya Pratama")
    setDate("05/08/2026")
    setReason("Kebutuhan liputan tim redaksi")
    setPrintReceipt(true)
  }
  return (
    <div className="min-h-svh bg-[#f7f8fa] text-[#1c1c1e]">
      <header className="flex h-16 items-center border-b border-[#e0e2e8] bg-white px-6 text-[13px] text-[#8e91a0]">
        <span className="text-[#6b6f7e]">Daftar Aset</span>
        <span className="px-2">/</span>
        <span className="font-mono">018/INC-GA/1/26</span>
        <span className="px-2">/</span>
        <span className="text-[#1c1c1e]">Mutasi</span>
      </header>
      <main className="mx-auto flex w-full max-w-[876px] flex-col gap-[18px] p-4 py-7 sm:p-7">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-.6px]">
            Mutasi &amp; serah terima aset
          </h1>
          <p className="mt-1 text-[13px] text-[#6b6f7e]">
            Tercatat di tabel{" "}
            <span className="font-mono text-[12px]">asset_movements</span>. Aset
            yang punya riwayat mutasi tidak dapat dihapus permanen (BR-11).
          </p>
        </div>
        <section className="flex flex-col gap-5 rounded-[20px] border border-[#eef0f3] bg-white p-5 sm:p-[22px]">
          <div className="flex items-center gap-[14px] border-b border-[#eef0f3] pb-[18px]">
            <div className="size-14 rounded-xl border border-[#e0e2e8] bg-[repeating-linear-gradient(135deg,#f7f8fa_0_8px,#eef0f3_8px_16px)]" />
            <div>
              <p className="font-mono text-[12px] text-[#4262ff]">
                018/INC-GA/1/26
              </p>
              <h2 className="text-[17px] font-semibold">
                Kamera Sony PXW-Z190
              </h2>
              <p className="text-[12px] text-[#6b6f7e]">
                Peralatan Kamera &amp; Lighting · 1 Unit · Bagus
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_40px_1fr] md:items-center">
            <LocationCard title="Dari" tone="neutral">
              <Data label="Lokasi" value="Studio Siaran L2" />
              <Data label="Pemegang" value="Budi Hartono" />
            </LocationCard>
            <span className="text-center text-[22px] text-[#8e91a0]">→</span>
            <LocationCard title="Ke" tone="target">
              <Field
                label="Lokasi tujuan *"
                value={location}
                onChange={setLocation}
              />
              <Field
                label="Pemegang baru"
                value={holder}
                onChange={setHolder}
              />
            </LocationCard>
          </div>
          <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
            <Field
              label="Tanggal mutasi *"
              value={date}
              onChange={setDate}
              mono
            />
            <Field
              label="Alasan mutasi *"
              value={reason}
              onChange={setReason}
            />
          </div>
          <label className="flex items-center gap-2 text-[13px] text-[#555a6a]">
            <input
              type="checkbox"
              checked={printReceipt}
              onChange={(e) => setPrintReceipt(e.target.checked)}
              className="size-4 accent-[#1c1c1e]"
            />
            Cetak berita acara serah terima (PDF) setelah disimpan
          </label>
          <div className="flex justify-end gap-2">
            <button
              onClick={reset}
              className="h-11 rounded-full px-5 text-[14px] font-semibold text-[#555a6a]"
            >
              Batal
            </button>
            <button
              onClick={() =>
                setNotice(
                  `Mutasi ke ${location} berhasil disimpan${printReceipt ? "; berita acara siap dicetak" : ""} (simulasi).`
                )
              }
              className="h-11 rounded-full bg-[#1c1c1e] px-6 text-[14px] font-semibold text-white"
            >
              Simpan Mutasi
            </button>
          </div>
        </section>
        {notice && (
          <button
            onClick={() => setNotice("")}
            className="rounded-lg bg-[#c3faf5] px-4 py-3 text-left text-[13px] text-[#187574]"
          >
            {notice} ×
          </button>
        )}
      </main>
    </div>
  )
}
function LocationCard({
  title,
  tone,
  children,
}: {
  title: string
  tone: "neutral" | "target"
  children: ReactNode
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl p-[18px] ${tone === "target" ? "bg-[#c3faf5]" : "bg-[#f7f8fa]"}`}
    >
      <span
        className={`text-[11px] font-semibold tracking-[.5px] uppercase ${tone === "target" ? "text-[#187574]" : "text-[#6b6f7e]"}`}
      >
        {title}
      </span>
      {children}
    </div>
  )
}
function Data({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11.5px] text-[#6b6f7e]">{label}</p>
      <p className="text-[15px] font-semibold">{value}</p>
    </div>
  )
}
function Field({
  label,
  value,
  onChange,
  mono = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  mono?: boolean
}) {
  return (
    <label className="flex flex-col gap-[6px]">
      <span className="text-[11.5px] text-[#6b6f7e]">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-11 rounded-lg border border-[#c7cad5] bg-white px-[13px] text-[14px] outline-none ${mono ? "font-mono" : ""}`}
      />
    </label>
  )
}
