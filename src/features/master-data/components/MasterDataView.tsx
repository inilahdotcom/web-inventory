import React, { useState } from 'react'

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
  onAddItem?: (type: 'kategori' | 'merek' | 'lokasi', data: { nama: string; kode: string; deskripsi: string }) => void
  onEditItem?: (type: 'kategori' | 'merek' | 'lokasi', id: string | number, data: { nama: string; kode: string; deskripsi: string }) => void
  onDelete?: (type: 'kategori' | 'merek' | 'lokasi', id: string | number) => void
}

export function MasterDataView({
  categories = [],
  merekList = [],
  lokasiList = [],
  onAddItem,
  onEditItem,
  onDelete
}: MasterDataViewProps) {
  const [activeTab, setActiveTab] = useState<'kategori' | 'merek' | 'lokasi'>('kategori')
  const [formData, setFormData] = useState({ nama: '', kode: '', deskripsi: '' })

  // State untuk Modal Pop-up Edit
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<{ id: string | number; nama: string; kode: string; deskripsi: string } | null>(null)

  const currentData = activeTab === 'kategori' ? categories : activeTab === 'merek' ? merekList : lokasiList

  const tabConfig = {
    kategori: {
      title: 'Kategori aset',
      desc: 'Delapan kategori awal diturunkan dari isi kolom ITEM pada file Excel.',
      labelNama: 'Nama Kategori',
      placeholderNama: 'mis. Peralatan Kebersihan',
      formTitle: 'Tambah kategori',
      btnSubmit: 'Simpan kategori',
      warning: 'Kategori terpakai tidak bisa dihapus'
    },
    merek: {
      title: 'Merek aset',
      desc: 'Daftar merek/brand perangkat dan peralatan aset inventaris.',
      labelNama: 'Nama Merek',
      placeholderNama: 'mis. Asus, Samsung, Logitech',
      formTitle: 'Tambah merek',
      btnSubmit: 'Simpan merek',
      warning: 'Merek terpakai tidak bisa dihapus'
    },
    lokasi: {
      title: 'Lokasi aset',
      desc: 'Daftar ruangan, lantai, atau area penempatan aset.',
      labelNama: 'Nama Lokasi',
      placeholderNama: 'mis. Lantai 2 - Ruang Rapat',
      formTitle: 'Tambah lokasi',
      btnSubmit: 'Simpan lokasi',
      warning: 'Lokasi terisi tidak bisa dihapus'
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onAddItem) onAddItem(activeTab, formData)
    setFormData({ nama: '', kode: '', deskripsi: '' })
  }

  // Fungsi Buka Modal Edit
  const handleOpenEdit = (item: UIMasterDataItem) => {
    setEditingItem({
      id: item.id,
      nama: item.nama,
      kode: item.kode === '-' ? '' : item.kode,
      deskripsi: item.deskripsi || ''
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
        deskripsi: editingItem.deskripsi
      })
    }
    setIsEditOpen(false)
    setEditingItem(null)
  }

  return (
    <div className="w-full text-[#1C1C1E]">
      {/* HEADER STICKY */}
      <header className="sticky top-0 z-10 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 pl-14 lg:pl-0 w-full overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-2xl w-fit shrink-0">
              <button
                type="button"
                onClick={() => { setActiveTab('kategori'); setFormData({ nama: '', kode: '', deskripsi: '' }) }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${activeTab === 'kategori' ? 'bg-neutral-900 text-neutral-100 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'}`}
              >
                Kategori <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'kategori' ? 'bg-neutral-100 text-neutral-900' : 'bg-neutral-200/60 text-neutral-600'}`}>{categories.length}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('merek'); setFormData({ nama: '', kode: '', deskripsi: '' }) }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${activeTab === 'merek' ? 'bg-neutral-900 text-neutral-100 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'}`}
              >
                Merek <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'merek' ? 'bg-neutral-100 text-neutral-900' : 'bg-neutral-200/60 text-neutral-600'}`}>{merekList.length}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('lokasi'); setFormData({ nama: '', kode: '', deskripsi: '' }) }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${activeTab === 'lokasi' ? 'bg-neutral-900 text-neutral-100 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'}`}
              >
                Lokasi <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'lokasi' ? 'bg-neutral-100 text-neutral-900' : 'bg-neutral-200/60 text-neutral-600'}`}>{lokasiList.length}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto space-y-6 pt-6 pb-12 px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{tabConfig[activeTab].title}</h1>
          <p className="text-xs text-neutral-500 mt-0.5">{tabConfig[activeTab].desc}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* TABEL DATA */}
          <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-137.5">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-6">{tabConfig[activeTab].labelNama}</th>
                    <th className="py-3.5 px-6">Kode</th>
                    <th className="py-3.5 px-6">Aset</th>
                    <th className="py-3.5 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-neutral-800">
                  {currentData.map((item) => {
                    const count = item.asetCount ?? item.asset_count ?? 0
                    const hasAssets = count > 0

                    return (
                      <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-neutral-900">{item.nama}</td>
                        <td className="py-4 px-6 font-mono text-neutral-600">{item.kode}</td>
                        <td className="py-4 px-6 font-mono font-medium text-neutral-700">{count}</td>
                        <td className="py-4 px-6 text-right space-x-3">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="font-medium text-blue-600 hover:underline cursor-pointer"
                          >
                            Ubah
                          </button>

                          <button
                            type="button"
                            disabled={hasAssets}
                            onClick={() => onDelete?.(activeTab, item.id)}
                            className={`font-medium transition-colors ${
                              hasAssets
                                ? 'text-neutral-300 cursor-not-allowed opacity-50'
                                : 'text-rose-600 hover:underline cursor-pointer'
                            }`}
                            title={hasAssets ? tabConfig[activeTab].warning : 'Hapus data'}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* FORM SIDEBAR (TAMBAH) */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">{tabConfig[activeTab].formTitle}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-700">Nama *</label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    placeholder={tabConfig[activeTab].placeholderNama}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-700">Kode</label>
                  <input
                    type="text"
                    name="kode"
                    value={formData.kode}
                    onChange={handleChange}
                    placeholder="KODE"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs font-mono text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-700">Deskripsi</label>
                  <textarea
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Opsional"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-neutral-900 py-3 text-xs font-medium text-white hover:bg-neutral-800 shadow-2xs transition-all cursor-pointer"
                >
                  {tabConfig[activeTab].btnSubmit}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL POPUP EDIT */}
      {isEditOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-neutral-900">Ubah {activeTab}</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-700">Nama *</label>
                <input
                  type="text"
                  value={editingItem.nama}
                  onChange={(e) => setEditingItem({ ...editingItem, nama: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-700">Kode</label>
                <input
                  type="text"
                  value={editingItem.kode}
                  onChange={(e) => setEditingItem({ ...editingItem, kode: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs font-mono text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-700">Deskripsi</label>
                <textarea
                  value={editingItem.deskripsi}
                  onChange={(e) => setEditingItem({ ...editingItem, deskripsi: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 cursor-pointer shadow-2xs transition-all"
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