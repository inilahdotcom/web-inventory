import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { InputField } from '@/components/ui/InputField'
import { SelectedField } from '@/components/ui/SelectedField'
import { assetService, type CreateAssetPayload } from '@/services/assetService'
import { masterDataService, type MasterDataItem } from '@/services/masterDataService'

// Map UI pilihan ke nilai ENUM database MySQL
const MAP_SATUAN: Record<string, string> = {
    'Unit': 'Unit',
    'Pcs': 'Pcs',
    'Set': 'Set',
}

const MAP_KONDISI: Record<string, string> = {
    'Bagus': 'Bagus',
    'Rusak Ringan': 'Rusak Ringan',
    'Rusak Berat': 'Rusak Berat',
    'Hilang': 'Hilang',
}

const MAP_STATUS: Record<string, string> = {
    'Digunakan': 'Digunakan',
    'Tersedia': 'Tersedia',
    'Diperbaiki': 'Diperbaiki',
}

export function AssetCreateView() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        namaBarang: '',
        kategori: '',  // category_id (number string) - diisi setelah data master dimuat
        merek: '',     // brand_id (number string)
        jumlah: 1,
        satuan: 'Unit',
        kondisi: 'Bagus',
        status: 'Digunakan',
        hargaPerolehan: '',
        tanggalPerolehan: '',
        lokasi: '',    // location_id (number string)
        pemegangAset: '',
        keterangan: '',
        kodeAset: '',  // Boleh kosong agar di-generate otomatis oleh Go
    })

    const [categories, setCategories] = useState<MasterDataItem[]>([])
    const [brands, setBrands] = useState<MasterDataItem[]>([])
    const [locations, setLocations] = useState<MasterDataItem[]>([])
    const [loadingMasterData, setLoadingMasterData] = useState(true)

    const [fotos, setFotos] = useState<File[]>([])
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [warningMessage, setWarningMessage] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [cats, brds, locs] = await Promise.all([
                    masterDataService.getCategories(),
                    masterDataService.getBrands(),
                    masterDataService.getLocations(),
                ])
                setCategories(cats)
                setBrands(brds)
                setLocations(locs)

                // set default value ke item pertama, kalau ada
                setFormData((prev) => ({
                    ...prev,
                    kategori: cats.length > 0 ? String(cats[0].id) : '',
                    lokasi: locs.length > 0 ? String(locs[0].id) : '',
                }))
            } catch (err) {
                console.error('Gagal mengambil data master:', err)
            } finally {
                setLoadingMasterData(false)
            }
        }
        fetchMasterData()
    }, [])

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
        setErrorMessage('')
        setWarningMessage('')

        try {

            let photoUrls: string[] = []
            if (fotos.length > 0) {
                photoUrls = await assetService.uploadPhoto(fotos)
            }

            const payload: CreateAssetPayload = {
                name: formData.namaBarang,
                category_id: Number(formData.kategori) || 1,
                brand_id: formData.merek ? Number(formData.merek) : undefined,
                quantity: Number(formData.jumlah) || 1,
                unit: MAP_SATUAN[formData.satuan] || 'Unit',
                condition: MAP_KONDISI[formData.kondisi] || 'Bagus',
                status: MAP_STATUS[formData.status] || 'Digunakan',
                purchase_price: formData.hargaPerolehan ? Number(formData.hargaPerolehan) : undefined,
                purchase_date: formData.tanggalPerolehan || undefined,
                location_id: formData.lokasi ? Number(formData.lokasi) : undefined,
                holder_name: formData.pemegangAset || undefined,
                notes: formData.keterangan || undefined,
                asset_code: formData.kodeAset || undefined,
                photos: photoUrls,
            }


            const res = await assetService.createAsset(payload)

            // 4. Tangkap warning kemiripan nama dari c.command.CreateAsset
            if (res.warning) {
                setWarningMessage(res.warning)
            }

            if (keepAdding) {
                // FR-C08: Pertahankan kategori, lokasi, dan tanggal perolehan
                setFormData((prev) => ({
                    ...prev,
                    namaBarang: '',
                    keterangan: '',
                    pemegangAset: '',
                    kodeAset: '',
                }))
                setFotos([])
                alert('Aset berhasil disimpan! Silakan tambah aset berikutnya.')
            } else {
                alert('Aset berhasil disimpan!')
                navigate({ to: '/asset' })
            }
        } catch (error: any) {
            console.error('Gagal menyimpan aset:', error)

            const rawMsg: string = error.response?.data?.message || error.response?.data?.error || ''
            let userFriendlyMsg = 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.'

            // 1. Filter Validasi Input / Required Field dari Go
            if (rawMsg.includes("failed on the 'required' tag")) {
                if (rawMsg.includes("'Name'")) {
                    userFriendlyMsg = 'Nama barang wajib diisi!'
                } else if (rawMsg.includes("'Category'")) {
                    userFriendlyMsg = 'Kategori aset wajib dipilih!'
                } else if (rawMsg.includes("'Quantity'")) {
                    userFriendlyMsg = 'Jumlah barang wajib diisi!'
                } else {
                    userFriendlyMsg = 'Mohon lengkapi semua field yang wajib diisi (*).'
                }
            }
            // 2. Filter Error Database & System Lainnya
            else if (rawMsg.includes('asset_photos') || rawMsg.includes('upload')) {
                userFriendlyMsg = 'Gagal memproses foto aset. Pastikan format file sesuai (JPG/PNG/WEBP).'
            } else if (rawMsg.includes('nomor urut kode aset sudah pernah digunakan')) {
                userFriendlyMsg = 'Nomor urut kode aset ini sudah pernah dipakai sebelumnya. Kosongkan agar dibuat otomatis, atau gunakan nomor lain.'
            } else if (rawMsg.includes('Duplicate entry') || rawMsg.includes('asset_code')) {
                userFriendlyMsg = 'Kode aset sudah digunakan. Silakan gunakan kode aset lain.'
            } else if (rawMsg.includes('foreign key constraint fails')) {
                userFriendlyMsg = 'Kategori, Merek, atau Lokasi yang dipilih tidak valid.'
            } else if (rawMsg && !rawMsg.includes('Field validation')) {
                // Hanya pakai rawMsg jika bukan string error internal/validator Go
                userFriendlyMsg = rawMsg
            }

            setErrorMessage(userFriendlyMsg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={(e) => handleSubmit(e, false)} className="relative min-h-svh flex flex-col justify-between text-[#1C1C1E]">
            <div>
                <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-neutral-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 text-xs text-neutral-500 pl-14 lg:pl-0">
                        <span>Daftar Aset</span>
                        <span className="text-neutral-300">/</span>
                        <span className="text-neutral-900 font-semibold">Tambah aset</span>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold shrink-0 select-none">
                        RS
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Tambah aset baru</h1>
                        <p className="text-xs text-neutral-500 mt-0.5">Field bertanda * wajib diisi. Validasi dijalankan di klien dan server (FR-C03).</p>
                    </div>

                    {/* Alert Error dari Server */}
                    {errorMessage && (
                        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700">
                            {errorMessage}
                        </div>
                    )}

                    {/* Alert Warning (Aset Mirip) dari Server */}
                    {warningMessage && (
                        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800">
                            <strong>Peringatan Kemiripan Aset:</strong> {warningMessage}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-4">
                                <h2 className="text-sm font-bold text-neutral-900">Identitas barang</h2>

                                <InputField
                                    label="Nama barang *"
                                    name="namaBarang"
                                    value={formData.namaBarang}
                                    onChange={handleChange}
                                    disabled={loading}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <SelectedField
                                        label="Kategori *"
                                        name="kategori"
                                        value={formData.kategori}
                                        onChange={handleChange}
                                        disabled={loading || loadingMasterData}
                                        options={categories.map((c) => ({ label: c.name, value: String(c.id) }))}
                                    />
                                    <SelectedField
                                        label="Merek"
                                        name="merek"
                                        value={formData.merek}
                                        onChange={handleChange}
                                        disabled={loading || loadingMasterData}
                                        helperText="Boleh dikosongkan. Admin dapat menambah merek baru dari sini."
                                        options={[
                                            { label: '- Tidak ada -', value: '' },
                                            ...brands.map((b) => ({ label: b.name, value: String(b.id) })),
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
                                        disabled={loading}
                                        helperText="Bilangan bulat minimal 1 (BR-03)."
                                    />
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-neutral-700">Satuan *</label>
                                        <div className="flex rounded-xl border border-neutral-300 p-1 bg-neutral-100">
                                            {['Unit', 'Pcs', 'Set'].map((item) => (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    disabled={loading}
                                                    onClick={() => setFormData((prev) => ({ ...prev, satuan: item }))}
                                                    className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition cursor-pointer ${formData.satuan === item ? 'bg-neutral-900 text-white shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
                                                        }`}
                                                >
                                                    {item}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-4">
                                <h2 className="text-sm font-bold text-neutral-900">Kondisi, lokasi, dan nilai</h2>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-neutral-700">Kondisi *</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Bagus', 'Rusak Ringan', 'Rusak Berat', 'Hilang'].map((kondisi) => (
                                            <span
                                                key={kondisi}
                                                onClick={() => !loading && setFormData((prev) => ({ ...prev, kondisi }))}
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
                                                onClick={() => !loading && setFormData((prev) => ({ ...prev, status }))}
                                                className={`rounded-full px-4 py-1 text-xs font-medium border cursor-pointer transition ${formData.status === status
                                                    ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                                                    : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                                                    }`}
                                            >
                                                {status}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-neutral-400 pt-1">Kondisi Rusak Berat atau Hilang tidak bisa berstatus Digunakan (BR-07).</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <InputField
                                        label="Harga perolehan"
                                        name="hargaPerolehan"
                                        value={formData.hargaPerolehan}
                                        onChange={handleChange}
                                        disabled={loading}
                                        helperText="Ketik nominal angka murni."
                                    />
                                    <InputField
                                        label="Tanggal perolehan"
                                        type="date"
                                        name="tanggalPerolehan"
                                        value={formData.tanggalPerolehan}
                                        onChange={handleChange}
                                        disabled={loading}
                                        helperText="Tidak boleh melebihi hari ini (BR-05)."
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <SelectedField
                                        label="Lokasi"
                                        name="lokasi"
                                        value={formData.lokasi}
                                        onChange={handleChange}
                                        disabled={loading || loadingMasterData}
                                        options={locations.map((l) => ({ label: l.name, value: String(l.id) }))}
                                    />
                                    <InputField
                                        label="Pemegang aset"
                                        name="pemegangAset"
                                        value={formData.pemegangAset}
                                        onChange={handleChange}
                                        disabled={loading}
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
                                        disabled={loading}
                                        placeholder="Spesifikasi, nomor seri, catatan kondisi per unit..."
                                        className="w-full rounded-xl border border-neutral-300 p-3 text-xs outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 resize-none disabled:bg-neutral-100"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-3">
                                <label className="text-xs font-semibold text-neutral-900 block">Kode aset</label>
                                <input
                                    type="text"
                                    name="kodeAset"
                                    value={formData.kodeAset}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="Otomatis di-generate jika dikosongkan"
                                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs bg-neutral-50 font-mono text-neutral-800 disabled:opacity-50"
                                />
                                <p className="text-[10px] text-neutral-400">Kosongkan agar dibuat otomatis oleh server dengan format NNN/INC-GA/M/YY (BR-01).</p>
                            </div>

                            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-semibold text-neutral-900">Foto aset</label>
                                    <span className="text-xs text-neutral-400">{fotos.length} dari 5</span>
                                </div>

                                <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-6 text-center space-y-1 cursor-pointer hover:bg-indigo-50/50 transition">
                                    <div className="text-xs font-medium text-indigo-600">Tarik file ke sini</div>
                                    <div className="text-[10px] text-neutral-400">JPG · PNG · WEBP – maks. 2 MB per file</div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/png, image/jpeg, image/webp"
                                        className="hidden"
                                        disabled={loading}
                                        onChange={handleFileChange}
                                    />
                                </label>

                                <div className="grid grid-cols-3 gap-3 pt-1">
                                    {fotos.map((file, index) => (
                                        <div key={index} className="relative aspect-square rounded-xl border border-neutral-200 bg-neutral-100 overflow-hidden flex items-center justify-center shadow-2xs">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${index}`}
                                                className="h-full w-full object-cover"
                                            />
                                            {index === 0 && (
                                                <span className="absolute bottom-1.5 left-1.5 rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-neutral-900 shadow-2xs">
                                                    Utama
                                                </span>
                                            )}
                                        </div>
                                    ))}

                                    {fotos.length < 5 && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={loading}
                                            className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 hover:border-indigo-300 hover:text-indigo-500 transition disabled:opacity-50 cursor-pointer"
                                        >
                                            <span className="text-xl font-light">+</span>
                                        </button>
                                    )}
                                </div>

                                <p className="text-[10px] text-neutral-400">Foto pertama otomatis jadi foto utama (BR-10).</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="sticky bottom-0 z-20 flex flex-col sm:flex-row items-center justify-between border-t border-neutral-200/80 bg-white/90 backdrop-blur-md px-6 lg:px-8 py-4 shadow-md gap-4">
                <span className="text-xs text-neutral-400">Perubahan belum tersimpan</span>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
                    <button
                        type="button"
                        onClick={() => navigate({ to: '/' })}
                        disabled={loading}
                        className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, true)}
                        disabled={loading}
                        className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-900 hover:bg-neutral-50 shadow-2xs disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? 'Menyimpan...' : 'Simpan & Tambah Lagi'}
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 shadow-2xs disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Aset'}
                    </button>
                </div>
            </div>
        </form>
    )
}