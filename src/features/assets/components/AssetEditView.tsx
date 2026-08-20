import React, { useState } from 'react'
import { InputField } from '@/components/ui/InputField'
import { SelectedField } from '@/components/ui/SelectedField'

export function AssetEditView() {
    const [formData, setFormData] = useState({
        kodeAset: '053/INC-GA/1/26',
        namaBarang: 'CPU Redaksi Lantai 3',
        kondisi: 'Rusak Berat',
        status: 'Diperbaiki',
        jumlah: 4,
        hargaPerolehan: '0',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <form onSubmit={(e) => e.preventDefault()} className="w-full min-h-svh flex flex-col justify-between text-[#1C1C1E]">
            <div className="space-y-6 pb-28">
                {/* STICKY HEADER (z-10 & pl-14 lg:pl-0 untuk ruang burger fixed) */}
                <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-neutral-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 lg:px-8">
                    
                    {/* Breadcrumb offset pl-14 di mobile agar bergeser ke kanan tombol burger */}
                    <div className="flex items-center gap-2 text-xs text-neutral-500 pl-14 lg:pl-0">
                        <span>Daftar Aset</span>
                        <span className="text-neutral-300">/</span>
                        <span>053/INC-GA/1/26</span>
                        <span className="text-neutral-300">/</span>
                        <span className="text-neutral-900 font-semibold">Ubah</span>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold shrink-0 select-none">
                        RS
                    </div>
                </header>

                {/* Konten Utama */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-2">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Ubah aset</h1>
                        <p className="text-xs text-neutral-500 mt-0.5">Setiap perubahan dicatat di audit log beserta nilai lama dan baru (FR-UD3).</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-neutral-700">Kode aset</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.kodeAset}
                                                disabled
                                                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-xs font-mono text-neutral-700 cursor-not-allowed"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                                                Read-only untuk Staff GA
                                            </span>
                                        </div>
                                    </div>

                                    <InputField
                                        label="Nama barang *"
                                        name="namaBarang"
                                        value={formData.namaBarang}
                                        onChange={handleChange}
                                        className="text-[#1C1C1E]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <SelectedField
                                        label="Kondisi *"
                                        name="kondisi"
                                        value={formData.kondisi}
                                        onChange={handleChange}
                                        className="text-[#1C1C1E] bg-white"
                                        options={[
                                            { label: 'Bagus', value: 'Bagus' },
                                            { label: 'Rusak Ringan', value: 'Rusak Ringan' },
                                            { label: 'Rusak Berat', value: 'Rusak Berat' },
                                            { label: 'Hilang', value: 'Hilang' },
                                        ]}
                                    />

                                    <SelectedField
                                        label="Status *"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="text-[#1C1C1E] bg-white"
                                        options={[
                                            { label: 'Digunakan', value: 'Digunakan' },
                                            { label: 'Tersedia', value: 'Tersedia' },
                                            { label: 'Diperbaiki', value: 'Diperbaiki' }
                                        ]}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField
                                        label="Jumlah *"
                                        type="number"
                                        name="jumlah"
                                        value={formData.jumlah}
                                        onChange={handleChange}
                                        className="text-[#1C1C1E]"
                                    />
                                    <InputField
                                        label="Harga perolehan"
                                        name="hargaPerolehan"
                                        value={formData.hargaPerolehan}
                                        onChange={handleChange}
                                        className="text-[#1C1C1E]"
                                    />
                                </div>

                                <div className="space-y-2 pt-2">
                                    <label className="text-xs font-semibold text-neutral-900">Kelola foto (FR-UD4)</label>
                                    <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                                        <div className="relative h-20 w-24 rounded-xl border-2 border-amber-400 bg-neutral-100 overflow-hidden flex items-center justify-center shadow-2xs shrink-0">
                                            <span className="absolute bottom-1 left-1 rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-neutral-900 shadow-2xs">
                                                Utama
                                            </span>
                                            <button type="button" className="absolute top-1 right-1 h-5 w-5 rounded-full bg-neutral-800/65 text-white flex items-center justify-center text-xs cursor-pointer">
                                                ×
                                            </button>
                                        </div>
                                        <div className="h-20 w-24 rounded-xl border border-dashed border-neutral-300 flex flex-col items-center justify-center text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 cursor-pointer bg-neutral-50/50 shrink-0 transition">
                                            <span className="text-xs font-medium text-center px-1">Jadikan utama</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 shadow-2xs space-y-3">
                                <h3 className="text-xs font-bold text-neutral-900">3 perubahan akan disimpan</h3>
                                <div className="text-xs space-y-2 text-neutral-600">
                                    <div>
                                        <span className="font-semibold text-neutral-700 block">Kondisi</span>
                                        <span className="text-neutral-500">Bagus → Rusak Berat</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-neutral-700 block">Status</span>
                                        <span className="text-neutral-500">Digunakan → Diperbaiki</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-neutral-700 block">Keterangan</span>
                                        <span className="text-neutral-500">+ catatan servis vendor</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs space-y-2">
                                <h3 className="text-xs font-bold text-neutral-900">Aset dihapuskan</h3>
                                <p className="text-[11px] text-neutral-500 leading-relaxed">
                                    Aset berstatus <span className="font-semibold text-neutral-700">Dihapuskan</span> hanya diubah oleh Admin (BR-08). Anda masuk sebagai Admin, jadi field tetap terbuka.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 z-20 flex items-center justify-between border-t border-neutral-200/80 bg-white/90 backdrop-blur-md px-6 lg:px-8 py-4 shadow-md">
                <span className="text-xs text-neutral-400">Perubahan belum tersimpan</span>
                <div className="flex gap-3">
                    <button type="button" className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 cursor-pointer">
                        Batal
                    </button>
                    <button type="submit" className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 shadow-2xs cursor-pointer">
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </form>
    )
}