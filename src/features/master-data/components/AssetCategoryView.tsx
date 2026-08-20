import React, { useState } from 'react'

export interface CategoryItem {
    id: string | number
    namaKategori: string
    kode: string
    asetCount: number
}

interface AssetCategoryViewProps {
    categories?: CategoryItem[]
    onAddCategory?: (data: {
        nama: string; kode: string; deskripsi: string
    }) => void
    onEdit?: (id: string | number) => void
    onDelete?: (id: string | number) => void
}

export function AssetCategoryView({
    categories = [
        { id: 1, namaKategori: 'Perangkat IT & Server', kode: 'IT-SRV', asetCount: 2 },
        { id: 2, namaKategori: 'Komputer & Laptop', kode: 'KOM-LPT', asetCount: 38 },
        { id: 3, namaKategori: 'Perangkat Jaringan', kode: 'NET', asetCount: 24 },
        { id: 4, namaKategori: 'Peralatan Kamera & Lighting', kode: 'CAM-LIGHT', asetCount: 18 },
        { id: 5, namaKategori: 'Peralatan Broadcast & Audio', kode: 'BRD-AUD', asetCount: 18 },
    ],
    onAddCategory,
    onEdit,
    onDelete
}: AssetCategoryViewProps) {
    const [activeTab, setActiveTab] = useState<'kategori' | 'merek' | 'lokasi'>('kategori')
    const [formData, setFormData] = useState({ nama: '', kode: '', deskripsi: '' })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (onAddCategory) onAddCategory(formData)
        setFormData({ nama: '', kode: '', deskripsi: '' })
    }

    return (
        <div className="w-full space-y-6 max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8 text-[#1C1C1E]">

            <div className="flex items-center gap-2 bg-neutral-900/5 p-1.5 rounded-2xl w-fit">
                <button 
                    type="button"
                    onClick={() => setActiveTab('kategori')}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${activeTab === 'kategori' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
                >
                    Kategori <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'kategori' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'}`}>8</span>
                </button>
                <button 
                    type="button"
                    onClick={() => setActiveTab('merek')}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${activeTab === 'merek' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
                >
                    Merek <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'merek' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'}`}>23</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('lokasi')} 
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${activeTab === 'lokasi' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
                >
                    Lokasi <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'lokasi' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'}`}>9</span>
                </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Kategori aset</h1>
                    <p className="text-xs text-neutral-500 mt-0.5">Delapan kategori awal diturunkan dari isi kolom ITEM pada file Excel.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
                <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs min-w-137.5">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                                    <th className="py-3.5 px-6">Nama Kategori</th>
                                    <th className="py-3.5 px-6">Kode</th>
                                    <th className="py-3.5 px-6">Aset</th>
                                    <th className="py-3.5 px-6 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 text-neutral-800">
                                {categories.map((item) => (
                                    <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="py-4 px-6 font-semibold text-neutral-900">{item.namaKategori}</td>
                                        <td className="py-4 px-6 font-mono text-neutral-600">{item.kode}</td>
                                        <td className="py-4 px-6 font-medium text-neutral-700">{item.asetCount}</td>
                                        <td className="py-4 px-6 text-right space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => onEdit?.(item.id)}
                                                className="font-medium text-blue-600 hover:underline"
                                            >
                                                Ubah
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => onDelete?.(item.id)}
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

             
                <div className="space-y-6">
                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-neutral-900">Tambah kategori</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-neutral-700">Nama *</label>
                                <input 
                                    type="text"
                                    name="nama"
                                    value={formData.nama}
                                    onChange={handleChange}
                                    placeholder="mis. Peralatan Kebersihan"
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
                                    placeholder="KBR"
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
                                Simpan kategori
                            </button>
                        </form>
                    </div>

                    <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4 text-xs text-[#78350F] shadow-sm space-y-1">
                        <span className="font-semibold block">Kategori terpakai tidak bisa dihapus</span>
                        <p className="text-[#92400E] text-[11px] leading-relaxed">
                            Tombol hapus dimatikan bila masih ada aset didalamnya. Pindahkan aset lebih dulu, atau gabungkan kategori.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}