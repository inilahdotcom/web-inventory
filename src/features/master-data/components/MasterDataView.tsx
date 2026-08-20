import React, { useState } from 'react'

export interface MasterDataItem {
    id: string | number
    nama: string
    kode: string
    asetCount: number
}

interface AssetCategoryViewProps {
    categories?: MasterDataItem[]
    merekList?: MasterDataItem[]
    lokasiList?: MasterDataItem[]
    onAddItem?: (type: 'kategori' | 'merek' | 'lokasi', data: { nama: string; kode: string; deskripsi: string }) => void
    onEdit?: (type: 'kategori' | 'merek' | 'lokasi', id: string | number) => void
    onDelete?: (type: 'kategori' | 'merek' | 'lokasi', id: string | number) => void
}

export function MasterDataView({
    categories = [
        { id: 1, nama: 'Perangkat IT & Server', kode: 'IT-SRV', asetCount: 2 },
        { id: 2, nama: 'Komputer & Laptop', kode: 'KOM-LPT', asetCount: 38 },
        { id: 3, nama: 'Perangkat Jaringan', kode: 'NET', asetCount: 24 },
        { id: 4, nama: 'Peralatan Kamera & Lighting', kode: 'CAM-LIGHT', asetCount: 18 },
        { id: 5, nama: 'Peralatan Broadcast & Audio', kode: 'BRD-AUD', asetCount: 18 },
    ],
    merekList = [
        { id: 1, nama: 'Lenovo', kode: 'LNV', asetCount: 12 },
        { id: 2, nama: 'Macbook', kode: 'APPLE', asetCount: 38 },
        { id: 3, nama: 'Biznet', kode: 'BZN', asetCount: 8 },
        { id: 4, nama: 'Leica', kode: 'LCA', asetCount: 5 },
        { id: 5, nama: 'Sony', kode: 'SNY', asetCount: 18 },
    ],
    lokasiList = [
        { id: 1, nama: 'Lantai 3 - Server Room', kode: 'L3-SRV', asetCount: 2 },
        { id: 2, nama: 'Lantai 3 - Studio Utama', kode: 'L3-STD', asetCount: 38 },
        { id: 3, nama: 'Lantai 2 - Ruang IT', kode: 'L2-IT', asetCount: 24 },
        { id: 4, nama: 'Lantai 1 - Gudang Aset', kode: 'L1-GDG', asetCount: 18 },
        { id: 5, nama: 'Lantai 3 - Ruang Redaksi', kode: 'L3-RDK', asetCount: 18 },
    ],
    onAddItem,
    onEdit,
    onDelete
}: AssetCategoryViewProps) {
    const [activeTab, setActiveTab] = useState<'kategori' | 'merek' | 'lokasi'>('kategori')
    const [formData, setFormData] = useState({ nama: '', kode: '', deskripsi: '' })

    const currentData = activeTab === 'kategori' ? categories : activeTab === 'merek' ? merekList : lokasiList

    const tabConfig = {
        kategori: {
            title: 'Kategori aset',
            desc: 'Delapan kategori awal diturunkan dari isi kolom ITEM pada file Excel.',
            labelNama: 'Nama Kategori',
            placeholderNama: 'mis. Peralatan Kebersihan',
            formTitle: 'Tambah kategori',
            btnSubmit: 'Simpan kategori',
            warning: 'Kategori terpakai tidak bisa dihapus',
            warningDesc: 'Tombol hapus dimatikan bila masih ada aset di dalamnya. Pindahkan aset lebih dulu, atau gabungkan kategori.'
        },
        merek: {
            title: 'Merek aset',
            desc: 'Daftar merek/brand perangkat dan peralatan aset inventaris.',
            labelNama: 'Nama Merek',
            placeholderNama: 'mis. Asus, Samsung, Logitech',
            formTitle: 'Tambah merek',
            btnSubmit: 'Simpan merek',
            warning: 'Merek terpakai tidak bisa dihapus',
            warningDesc: 'Merek yang masih terhubung dengan unit aset tidak dapat dihapus.'
        },
        lokasi: {
            title: 'Lokasi aset',
            desc: 'Daftar ruangan, lantai, atau area penempatan aset.',
            labelNama: 'Nama Lokasi',
            placeholderNama: 'mis. Lantai 2 - Ruang Rapat',
            formTitle: 'Tambah lokasi',
            btnSubmit: 'Simpan lokasi',
            warning: 'Lokasi terisi tidak bisa dihapus',
            warningDesc: 'Pastikan seluruh aset telah dipindahkan ke lokasi lain sebelum menghapus lokasi ini.'
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

    return (
        <div className="w-full text-[#1C1C1E]">
            <header className="sticky top-0 z-10 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2 bg-neutral-900/5 p-1.5 rounded-2xl w-fit">
                        <button
                            type="button"
                            onClick={() => { setActiveTab('kategori'); setFormData({ nama: '', kode: '', deskripsi: '' }) }}
                            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${activeTab === 'kategori' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
                        >
                            Kategori <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'kategori' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'}`}>{categories.length}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setActiveTab('merek'); setFormData({ nama: '', kode: '', deskripsi: '' }) }}
                            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${activeTab === 'merek' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
                        >
                            Merek <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'merek' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'}`}>{merekList.length}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setActiveTab('lokasi'); setFormData({ nama: '', kode: '', deskripsi: '' }) }}
                            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${activeTab === 'lokasi' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
                        >
                            Lokasi <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'lokasi' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'}`}>{lokasiList.length}</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto space-y-6 pt-6 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{tabConfig[activeTab].title}</h1>
                        <p className="text-xs text-neutral-500 mt-0.5">{tabConfig[activeTab].desc}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* TABEL DATA */}
                    <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
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
                                    {currentData.map((item) => (
                                        <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="py-4 px-6 font-semibold text-neutral-900">{item.nama}</td>
                                            <td className="py-4 px-6 font-mono text-neutral-600">{item.kode}</td>
                                            <td className="py-4 px-6 font-medium text-neutral-700">{item.asetCount}</td>
                                            <td className="py-4 px-6 text-right space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={() => onEdit?.(activeTab, item.id)}
                                                    className="font-medium text-blue-600 hover:underline"
                                                >
                                                    Ubah
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete?.(activeTab, item.id)}
                                                    className="font-medium text-rose-600 hover:underline"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SIDEBAR FORM & WARNING */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
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
                                    className="w-full rounded-xl bg-neutral-900 py-3 text-xs font-medium text-white hover:bg-neutral-800 shadow-sm transition-all"
                                >
                                    {tabConfig[activeTab].btnSubmit}
                                </button>
                            </form>
                        </div>

                        <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4 text-xs text-[#78350F] shadow-sm space-y-1">
                            <span className="font-semibold block">{tabConfig[activeTab].warning}</span>
                            <p className="text-[#92400E] text-[11px] leading-relaxed">
                                {tabConfig[activeTab].warningDesc}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}