import React, { useState } from 'react'
import { InputField } from '@/components/ui/InputField'
import { SelectedField } from '@/components/ui/SelectedField'

export function AssetCreateView() {
    const [formData, setFormData] = useState({
        namaBarang: 'MacBook Pro M1 13',
        kategori: 'laptop',
        merek: 'APPLE',
        jumlah: 1,
        satuan: 'Unit',
        kondisi: 'Bagus',
        status: 'Digunakan',
        hargaPerolehan: '19519000',
        tanggalPerolehan: '2026-08-05',
        lokasi: 'lt3',
        pemegangAset: '',
        keterangan: '',
        kodeAset: '896/INC-GA/8/26',
    })

    const [fotos, setFotos] = useState<File[]>([])
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const uploadedFiles = Array.from(e.target.files)
            if (fotos.length + uploadedFiles.length <= 5) {
                setFotos((prev) => [...prev, ...uploadedFiles])
            } else {
                alert('Maksimal 5 foto aset!')
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent, keepAdding: boolean = false) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = new FormData()
            Object.entries(formData).forEach(([key, value]) => {
                payload.append(key, value.toString())
            })
            fotos.forEach((file, index) => {
                payload.append(`foto_${index}`, file)
            })

            console.log('Payload siap dikirim ke API:', formData, 'Jumlah Foto:', fotos.length)

            alert(keepAdding ? 'Aset berhasil disimpan! Silakan tambah lagi.' : 'Aset berhasil disimpan!')

            if (keepAdding) {
                setFormData((prev) => ({ ...prev, namaBarang: '', keterangan: '' }))
                setFotos([])
            }
        } catch (error) {
            console.error('Gagal menyimpan aset:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={(e) => handleSubmit(e, false)} className="relative min-h-svh flex flex-col justify-between">
            <div>
                <div className="flex flex-row sticky top-0 z-30 items-center justify-between gap-4 border-b border-neutral-200 bg-white pl-14 pr-6 sm:px-6 lg:px-8 py-3 mb-6 w-full shadow-xs">
                    <div className="text-xs text-neutral-500 space-x-2 truncate">
                        <span>Daftar Aset</span>
                        <span>/</span>
                        <span className="text-neutral-900 font-medium">Tambah aset</span>
                    </div>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                        RS
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Tambah aset baru</h1>
                        <p className="text-xs text-neutral-500">Field bertanda * wajib diisi. Validasi dijalankan di klien dan server (FR-C03).</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
                                <h2 className="text-sm font-semibold text-neutral-900">Identitas barang</h2>

                                <InputField
                                    label="Nama barang *"
                                    name="namaBarang"
                                    value={formData.namaBarang}
                                    onChange={handleChange}
                                    errorText="Nama ini sangat mirip dengan 021/INC-GA/1/26 – MacBook Pro M1 13&quot; (Redaksi L3). Pastikan bukan aset yang sama (FR-C07)."
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <SelectedField
                                        label="Kategori *"
                                        name="kategori"
                                        value={formData.kategori}
                                        onChange={handleChange}
                                        options={[{ label: 'Komputer & Laptop', value: 'laptop' }]}
                                    />
                                    <InputField
                                        label="Merek"
                                        name="merek"
                                        value={formData.merek}
                                        onChange={handleChange}
                                        helperText="Boleh dikosongkan. Admin dapat menambah merek baru dari sini."
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField
                                        label="Jumlah *"
                                        type="number"
                                        name="jumlah"
                                        value={formData.jumlah}
                                        onChange={handleChange}
                                        helperText="Bilangan bulat minimal 1 (BR-03)."
                                    />
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-neutral-700">Satuan *</label>
                                        <div className="flex rounded-lg border border-neutral-300 p-1 bg-neutral-100">
                                            {['Unit', 'Pcs', 'Set'].map((item) => (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    onClick={() => setFormData((prev) => ({ ...prev, satuan: item }))}
                                                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${formData.satuan === item ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
                                                        }`}
                                                >
                                                    {item}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
                                <h2 className="text-sm font-semibold text-neutral-900">Kondisi, lokasi, dan nilai</h2>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-neutral-700">Kondisi *</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Bagus', 'Rusak Ringan', 'Rusak Berat', 'Hilang'].map((kondisi) => (
                                            <span
                                                key={kondisi}
                                                onClick={() => setFormData((prev) => ({ ...prev, kondisi }))}
                                                className={`rounded-full px-4 py-1 text-xs font-medium border cursor-pointer transition ${formData.kondisi === kondisi
                                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold'
                                                        : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                                                    }`}
                                            >
                                                {kondisi}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1 pt-2">
                                    <label className="text-xs font-medium text-neutral-700">Status *</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Digunakan', 'Tersedia', 'Diperbaiki'].map((status) => (
                                            <span
                                                key={status}
                                                onClick={() => setFormData((prev) => ({ ...prev, status }))}
                                                className={`rounded-full px-4 py-1 text-xs font-medium border cursor-pointer transition ${formData.status === status
                                                        ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                                                        : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                                                    }`}
                                            >
                                                {status}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-neutral-400">Kondisi Rusak Berat atau Hilang tidak bisa berstatus Digunakan (BR-07).</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <InputField
                                        label="Harga perolehan"
                                        name="hargaPerolehan"
                                        value={formData.hargaPerolehan}
                                        onChange={handleChange}
                                        helperText="Ketik 19519000 – pemisah ribuan ditambahkan otomatis (FR-C04)."
                                    />
                                    <InputField
                                        label="Tanggal perolehan"
                                        type="date"
                                        name="tanggalPerolehan"
                                        value={formData.tanggalPerolehan}
                                        onChange={handleChange}
                                        helperText="Tidak boleh melebihi hari ini (BR-05)."
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <SelectedField
                                        label="Lokasi"
                                        name="lokasi"
                                        value={formData.lokasi}
                                        onChange={handleChange}
                                        options={[{ label: 'Redaksi Lantai 3', value: 'lt3' }]}
                                    />
                                    <InputField
                                        label="Pemegang aset"
                                        name="pemegangAset"
                                        value={formData.pemegangAset}
                                        onChange={handleChange}
                                        placeholder="Nama karyawan atau tim"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-neutral-700">Keterangan barang</label>
                                    <textarea
                                        rows={3}
                                        name="keterangan"
                                        value={formData.keterangan}
                                        onChange={handleChange}
                                        placeholder="Spesifikasi, nomor seri, catatan kondisi per unit..."
                                        className="w-full rounded-lg border border-neutral-300 p-3 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-3">
                                <label className="text-xs font-semibold text-neutral-900 block">Kode aset *</label>
                                <input
                                    type="text"
                                    name="kodeAset"
                                    value={formData.kodeAset}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-neutral-50 font-mono text-neutral-800"
                                />
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-emerald-600 font-medium">Dibuat otomatis</span>
                                    <button type="button" className="text-blue-600 hover:underline">Ubah manual</button>
                                </div>
                                <p className="text-[10px] text-neutral-400">Format NNN/INC-GA/M/YY – nomor urut berikutnya setelah 095. Wajib unik termasuk terhadap aset yang sudah dihapus (BR-01).</p>
                            </div>

                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-semibold text-neutral-900">Foto aset</label>
                                    <span className="text-xs text-neutral-400">{fotos.length} dari 5</span>
                                </div>

                                <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-6 text-center space-y-1 cursor-pointer hover:bg-indigo-50/50 transition">
                                    <div className="text-xs font-medium text-indigo-600">Tarik file ke sini</div>
                                    <div className="text-[10px] text-neutral-400">JPG · PNG · WEBP – maks. 2 MB per file</div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/png, image/jpeg, image/webp"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>

                                <div className="flex items-center gap-3 pt-1 overflow-x-auto pb-2">
                                    {fotos.map((file, index) => (
                                        <div key={index} className="relative h-16 w-16 rounded-xl border border-neutral-200 bg-neutral-100 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${index}`}
                                                className="h-full w-full object-cover"
                                            />
                                            {index === 0 && (
                                                <span className="absolute bottom-1 left-1 rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-neutral-900 shadow-sm">
                                                    Utama
                                                </span>
                                            )}
                                        </div>
                                    ))}

                                    {fotos.length < 5 && (
                                        <label className="h-16 w-16 rounded-xl border border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 cursor-pointer shrink-0 transition bg-neutral-50/50">
                                            <span className="text-lg font-light">+</span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/png, image/jpeg, image/webp"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    )}
                                </div>

                                <p className="text-[10px] text-neutral-400">Foto pertama otomatis jadi foto utama (BR-10).</p>
                            </div>

                            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 space-y-1">
                                <span className="text-xs font-semibold text-rose-900 block">Input beruntun</span>
                                <p className="text-[11px] text-rose-700">Mencatat banyak aset sekaligus? Pakai “Simpan & Tambah Lagi” — kategori, lokasi, dan tanggal tetap terisi untuk entri berikutnya (FR-C08).</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="sticky bottom-0 z-20 flex flex-col sm:flex-row items-center justify-between border-t border-neutral-200 bg-white px-6 lg:px-8 py-4 shadow-md gap-4">
                <span className="text-xs text-neutral-400">Perubahan belum tersimpan</span>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
                    <button type="button" className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100">Batal</button>
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, true)}
                        disabled={loading}
                        className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-900 hover:bg-neutral-50 shadow-sm disabled:opacity-50"
                    >
                        {loading ? 'Menyimpan...' : 'Simpan & Tambah Lagi'}
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 shadow-sm disabled:opacity-50"
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Aset'}
                    </button>
                </div>
            </div>
        </form>
    )
}