import React, { useState } from "react"
import { usePermission } from "@/hooks/usePermission"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"

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
          <Card className="overflow-hidden lg:col-span-2">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-hairline bg-muted/50">
                    <TableHead className="px-6 py-3.5 text-[10px] font-semibold tracking-wider uppercase">
                      {tabConfig[activeTab].labelNama}
                    </TableHead>
                    <TableHead className="px-6 py-3.5 text-[10px] font-semibold tracking-wider uppercase">
                      Kode
                    </TableHead>
                    <TableHead className="px-6 py-3.5 text-[10px] font-semibold tracking-wider uppercase">
                      Aset
                    </TableHead>
                    {/* Tampilkan kolom Aksi hanya jika Admin */}
                    {canManageMasterData && (
                      <TableHead className="px-6 py-3.5 text-right text-[10px] font-semibold tracking-wider uppercase">
                        Aksi
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={canManageMasterData ? 4 : 3}
                        className="px-6 py-8 text-center text-xs text-muted-foreground"
                      >
                        Belum ada data {activeTab}.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentData.map((item) => {
                      const count = item.asetCount ?? item.asset_count ?? 0
                      const hasAssets = count > 0

                      return (
                        <TableRow
                          key={item.id}
                          className="transition-colors hover:bg-muted/50"
                        >
                          <TableCell className="px-6 py-4 font-semibold text-foreground">
                            {item.nama}
                          </TableCell>
                          <TableCell className="px-6 py-4 font-mono text-muted-foreground">
                            {item.kode}
                          </TableCell>
                          <TableCell className="px-6 py-4 font-mono font-medium">
                            <Badge variant="outline">{count}</Badge>
                          </TableCell>

                          {/* Tombol Ubah & Hapus hanya tampil jika Admin */}
                          {canManageMasterData && (
                            <TableCell className="space-x-3 px-6 py-4 text-right">
                              <Button
                                type="button"
                                variant="link"
                                size="sm"
                                onClick={() => handleOpenEdit(item)}
                                className="h-auto p-0 font-medium text-blue-600 hover:underline"
                              >
                                Ubah
                              </Button>

                              <Button
                                type="button"
                                variant="link"
                                size="sm"
                                disabled={hasAssets}
                                onClick={() => onDelete?.(activeTab, item.id)}
                                className={`h-auto p-0 font-medium transition-colors ${
                                  hasAssets
                                    ? "cursor-not-allowed text-muted-foreground/40 opacity-50"
                                    : "text-destructive hover:underline"
                                }`}
                                title={
                                  hasAssets
                                    ? tabConfig[activeTab].warning
                                    : "Hapus data"
                                }
                              >
                                Hapus
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* FORM SIDEBAR / READ-ONLY NOTICE */}
          <div className="space-y-6">
            {canManageMasterData ? (
              <Card className="p-6">
                <h3 className="mb-4 text-sm font-bold text-foreground">
                  {tabConfig[activeTab].formTitle}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="master-nama">Nama *</Label>
                    <Input
                      id="master-nama"
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      placeholder={tabConfig[activeTab].placeholderNama}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="master-kode">Kode</Label>
                    <Input
                      id="master-kode"
                      name="kode"
                      value={formData.kode}
                      onChange={handleChange}
                      placeholder="KODE"
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="master-deskripsi">Deskripsi</Label>
                    <Textarea
                      id="master-deskripsi"
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Opsional"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full"
                  >
                    {tabConfig[activeTab].btnSubmit}
                  </Button>
                </form>
              </Card>
            ) : (
              <Alert variant="warning">
                <AlertTitle className="text-xs font-bold">
                  Mode Pratinjau (Read-Only)
                </AlertTitle>
                <AlertDescription className="text-xs leading-relaxed">
                  Pengelolaan master data (tambah, ubah, dan hapus) hanya dapat
                  dilakukan oleh pengguna dengan hak akses{" "}
                  <strong>Admin</strong>.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      {/* MODAL POPUP EDIT (Khusus Admin) */}
      <Dialog
        open={Boolean(canManageMasterData && isEditOpen && editingItem)}
        onOpenChange={(open) => {
          if (!open) setIsEditOpen(false)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah {activeTab}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-nama">Nama *</Label>
                <Input
                  id="edit-nama"
                  value={editingItem.nama}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, nama: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-kode">Kode</Label>
                <Input
                  id="edit-kode"
                  value={editingItem.kode}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, kode: e.target.value })
                  }
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-deskripsi">Deskripsi</Label>
                <Textarea
                  id="edit-deskripsi"
                  value={editingItem.deskripsi}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      deskripsi: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
