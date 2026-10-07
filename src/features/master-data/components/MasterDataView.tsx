import React, { useState } from "react"
import { usePermission } from "@/hooks/usePermission"

export interface UIMasterDataItem {
  id: string | number
  nama: string
  kode: string
  deskripsi?: string
  asetCount: number
  asset_count?: number
}

interface MasterDataViewProps {
  categories?: UIMasterDataItem[]
  merekList?: UIMasterDataItem[]
  lokasiList?: UIMasterDataItem[]
  onAddItem?: (
    type: "kategori" | "merek" | "lokasi",
    data: { nama: string; kode: string; deskripsi: string }
  ) => void
  onEditItem?: (
    type: "kategori" | "merek" | "lokasi",
    id: string | number,
    data: { nama: string; kode: string; deskripsi: string }
  ) => void
  onDelete?: (
    type: "kategori" | "merek" | "lokasi",
    id: string | number
  ) => void
}

export function MasterDataView({
  categories = [],
  merekList = [],
  lokasiList = [],
  onAddItem,
  onEditItem,
  onDelete,
}: MasterDataViewProps) {
  // Panggil hook permission untuk mengontrol hak akses kelola master data (Khusus Admin)
  const { canManageMasterData } = usePermission()

  const [activeTab, setActiveTab] = useState<"kategori" | "merek" | "lokasi">(
    "kategori"
  )
  const [formData, setFormData] = useState({
    nama: "",
    kode: "",
    deskripsi: "",
  })

  // State untuk Modal Pop-up Edit
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<{
    id: string | number
    nama: string
    kode: string
    deskripsi: string
  } | null>(null)

  const currentData =
    activeTab === "kategori"
      ? categories
      : activeTab === "merek"
        ? merekList
        : lokasiList

  const tabConfig = {
    kategori: {
      title: "Kategori aset",
      desc: "Delapan kategori awal diturunkan dari isi kolom ITEM pada file Excel.",
      labelNama: "Nama Kategori",
      placeholderNama: "mis. Peralatan Kebersihan",
      formTitle: "Tambah kategori",
      btnSubmit: "Simpan kategori",
      warning: "Kategori terpakai tidak bisa dihapus",
    },
    merek: {
      title: "Merek aset",
      desc: "Daftar merek/brand perangkat dan peralatan aset inventaris.",
      labelNama: "Nama Merek",
      placeholderNama: "mis. Asus, Samsung, Logitech",
      formTitle: "Tambah merek",
      btnSubmit: "Simpan merek",
      warning: "Merek terpakai tidak bisa dihapus",
    },
    lokasi: {
      title: "Lokasi aset",
      desc: "Daftar ruangan, lantai, atau area penempatan aset.",
      labelNama: "Nama Lokasi",
      placeholderNama: "mis. Lantai 2 - Ruang Rapat",
      formTitle: "Tambah lokasi",
      btnSubmit: "Simpan lokasi",
      warning: "Lokasi terisi tidak bisa dihapus",
    },
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onAddItem) onAddItem(activeTab, formData)
    setFormData({ nama: "", kode: "", deskripsi: "" })
  }

  // Fungsi Buka Modal Edit
  const handleOpenEdit = (item: UIMasterDataItem) => {
    setEditingItem({
      id: item.id,
      nama: item.nama,
      kode: item.kode === "-" ? "" : item.kode,
      deskripsi: item.deskripsi || "",
    })
    setIsEditOpen(true)
  }

  // Fungsi Submit Simpan Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingItem && onEditItem) {
      onEditItem(activeTab, editingItem.id, {
        nama: editingItem.nama,
        kode: editingItem.kode,
        deskripsi: editingItem.deskripsi,
      })
    }
    setIsEditOpen(false)
    setEditingItem(null)
  }

  return (
    <div className="w-full text-[#1C1C1E]">
      {/* HEADER STICKY */}
      <header className="sticky top-0 z-10 w-full border-b border-neutral-200/80 bg-white/90 px-4 py-2.5 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="no-scrollbar flex w-full items-center gap-3 overflow-x-auto pl-14 lg:pl-0">
            <div className="flex w-fit shrink-0 items-center gap-1.5 rounded-2xl bg-neutral-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("kategori")
                  setFormData({ nama: "", kode: "", deskripsi: "" })
                }}
                className={`shrink-0 cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${activeTab === "kategori" ? "bg-neutral-900 text-neutral-100 shadow-2xs" : "text-neutral-500 hover:text-neutral-900"}`}
              >
                Kategori{" "}
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === "kategori" ? "bg-neutral-100 text-neutral-900" : "bg-neutral-200/60 text-neutral-600"}`}
                >
                  {categories.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("merek")
                  setFormData({ nama: "", kode: "", deskripsi: "" })
                }}
                className={`shrink-0 cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${activeTab === "merek" ? "bg-neutral-900 text-neutral-100 shadow-2xs" : "text-neutral-500 hover:text-neutral-900"}`}
              >
                Merek{" "}
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === "merek" ? "bg-neutral-100 text-neutral-900" : "bg-neutral-200/60 text-neutral-600"}`}
                >
                  {merekList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("lokasi")
                  setFormData({ nama: "", kode: "", deskripsi: "" })
                }}
                className={`shrink-0 cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${activeTab === "lokasi" ? "bg-neutral-900 text-neutral-100 shadow-2xs" : "text-neutral-500 hover:text-neutral-900"}`}
              >
                Lokasi{" "}
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === "lokasi" ? "bg-neutral-100 text-neutral-900" : "bg-neutral-200/60 text-neutral-600"}`}
                >
                  {lokasiList.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 pt-6 pb-12 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {tabConfig[activeTab].title}
          </h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            {tabConfig[activeTab].desc}
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {/* TABEL DATA */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xs lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full min-w-137.5 border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                    <th className="px-6 py-3.5">
                      {tabConfig[activeTab].labelNama}
                    </th>
                    <th className="px-6 py-3.5">Kode</th>
                    <th className="px-6 py-3.5">Aset</th>
                    {/* Tampilkan kolom Aksi hanya jika Admin */}
                    {canManageMasterData && (
                      <th className="px-6 py-3.5 text-right">Aksi</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-neutral-800">
                  {currentData.map((item) => {
                    const count = item.asetCount ?? item.asset_count ?? 0
                    const hasAssets = count > 0

                    return (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-neutral-50/50"
                      >
                        <td className="px-6 py-4 font-semibold text-neutral-900">
                          {item.nama}
                        </td>
                        <td className="px-6 py-4 font-mono text-neutral-600">
                          {item.kode}
                        </td>
                        <td className="px-6 py-4 font-mono font-medium text-neutral-700">
                          {count}
                        </td>

                        {/* Tombol Ubah & Hapus hanya tampil jika Admin */}
                        {canManageMasterData && (
                          <td className="space-x-3 px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="cursor-pointer font-medium text-blue-600 hover:underline"
                            >
                              Ubah
                            </button>

                            <button
                              type="button"
                              disabled={hasAssets}
                              onClick={() => onDelete?.(activeTab, item.id)}
                              className={`font-medium transition-colors ${
                                hasAssets
                                  ? "cursor-not-allowed text-neutral-300 opacity-50"
                                  : "cursor-pointer text-rose-600 hover:underline"
                              }`}
                              title={
                                hasAssets
                                  ? tabConfig[activeTab].warning
                                  : "Hapus data"
                              }
                            >
                              Hapus
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* FORM SIDEBAR / READ-ONLY NOTICE */}
          <div className="space-y-6">
            {canManageMasterData ? (
              <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
                <h3 className="text-sm font-bold text-neutral-900">
                  {tabConfig[activeTab].formTitle}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-700">
                      Nama *
                    </label>
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      placeholder={tabConfig[activeTab].placeholderNama}
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs text-neutral-800 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-700">
                      Kode
                    </label>
                    <input
                      type="text"
                      name="kode"
                      value={formData.kode}
                      onChange={handleChange}
                      placeholder="KODE"
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 font-mono text-xs text-neutral-800 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-700">
                      Deskripsi
                    </label>
                    <textarea
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Opsional"
                      className="w-full resize-none rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs text-neutral-800 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full cursor-pointer rounded-xl bg-neutral-900 py-3 text-xs font-medium text-white shadow-2xs transition-all hover:bg-neutral-800"
                  >
                    {tabConfig[activeTab].btnSubmit}
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
                <h3 className="text-xs font-bold text-amber-900">
                  Mode Pratinjau (Read-Only)
                </h3>
                <p className="text-xs leading-relaxed text-amber-800">
                  Pengelolaan master data (tambah, ubah, dan hapus) hanya dapat
                  dilakukan oleh pengguna dengan hak akses{" "}
                  <strong>Admin</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL POPUP EDIT (Khusus Admin) */}
      {canManageMasterData && isEditOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/40 p-4 backdrop-blur-xs duration-200 fade-in">
          <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900">
              Ubah {activeTab}
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-700">
                  Nama *
                </label>
                <input
                  type="text"
                  value={editingItem.nama}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, nama: e.target.value })
                  }
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs text-neutral-800 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-700">
                  Kode
                </label>
                <input
                  type="text"
                  value={editingItem.kode}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, kode: e.target.value })
                  }
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 font-mono text-xs text-neutral-800 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-700">
                  Deskripsi
                </label>
                <textarea
                  value={editingItem.deskripsi}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      deskripsi: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full resize-none rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs text-neutral-800 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="cursor-pointer rounded-xl px-4 py-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-xl bg-neutral-900 px-4 py-2 text-xs font-medium text-white shadow-2xs transition-all hover:bg-neutral-800"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
