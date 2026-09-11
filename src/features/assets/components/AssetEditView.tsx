import React, { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Route } from '@/routes/_app/asset/$id.edit'
import { InputField } from '@/components/ui/InputField'
import { SelectedField } from '@/components/ui/SelectedField'
import { assetService, type UpdateAssetPayload, type AssetAttr, type AssetPhoto } from '@/services/assetService'

export function AssetEditView() {
    const { id } = Route.useParams()
    const navigate = useNavigate()

    const [asset, setAsset] = useState<AssetAttr | null>(null)
    const [photos, setPhotos] = useState<AssetPhoto[]>([])
    const [fetching, setFetching] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        kodeAset: '',
        namaBarang: '',
        kondisi: '',
        status: '',
        jumlah: 0,
        hargaPerolehan: '0',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [photoError, setPhotoError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true
        setFetching(true)
        assetService.getAssetById(id)
            .then((result) => {
                if (!isMounted) return
                setAsset(result)
                const attrs = result.attributes
                setPhotos(attrs.photos ?? [])
                setFormData({
                    kodeAset: attrs.code,
                    namaBarang: attrs.name,
                    kondisi: attrs.condition,
                    status: attrs.status,
                    jumlah: attrs.quantity,
                    hargaPerolehan: String(attrs.acquisitionPrice ?? '0'),
                })
            })
            .catch((err: any) => {
                if (isMounted) setFetchError(err.response?.data?.message || 'Gagal memuat data aset')
            })
            .finally(() => {
                if (isMounted) setFetching(false)
            })
        return () => { isMounted = false }
    }, [id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleCancel = () => {
        navigate({ to: `/asset` })
    }

    const handleSetPrimary = async (photoId: number) => {
        setPhotoError(null)
        try {
            await assetService.setPrimaryPhoto(id, photoId)
            setPhotos((prev) => prev.map((p) => ({ ...p, isPrimary: p.id === photoId })))
        } catch (err: any) {
            setPhotoError(err.response?.data?.message || 'Gagal menjadikan foto utama')
        }
    }

    const handleDeletePhoto = async (photoId: number) => {
        setPhotoError(null)
        try {
            await assetService.deletePhoto(photoId)
            setPhotos((prev) => prev.filter((p) => p.id !== photoId))
        } catch (err: any) {
            setPhotoError(err.response?.data?.message || 'Gagal menghapus foto')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!asset) return

        const attrs = asset.attributes

        // Cek apakah ada perubahan dibanding data asli
        const hasChanges =
            formData.namaBarang !== attrs.name ||
            formData.kondisi !== attrs.condition ||
            formData.status !== attrs.status ||
            Number(formData.jumlah) !== attrs.quantity ||
            Number(formData.hargaPerolehan) !== (attrs.acquisitionPrice ?? 0)

        if (!hasChanges) {
            setError('Anda belum mengubah apapun')
            return
        }

        setLoading(true)
        setError(null)

        const payload: UpdateAssetPayload = {
            asset_code: formData.kodeAset,
            name: formData.namaBarang,
            condition: formData.kondisi,
            status: formData.status,
            quantity: Number(formData.jumlah),
            purchase_price: Number(formData.hargaPerolehan),
            category_id: attrs.categoryId ?? undefined,
            brand_id: attrs.brandId ?? undefined,
            unit: attrs.unit,
            purchase_date: attrs.acquisitionDate ?? undefined,
            location_id: attrs.locationId ?? undefined,
            holder_name: attrs.holder ?? undefined,
            notes: attrs.description ?? undefined,
        }

        try {
            await assetService.updateAsset(id, payload)
            alert('Perubahan berhasil disimpan!')
            navigate({ to: '/asset' })
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal menyimpan perubahan')
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return <div className="p-8 text-sm text-neutral-500">Memuat data aset...</div>
    }
    if (fetchError || !asset) {
        return <div className="p-8 text-sm text-red-600">{fetchError || 'Aset tidak ditemukan'}</div>
    }

    const attrs = asset.attributes

    return (
        <form onSubmit={handleSubmit} className="w-full min-h-svh flex flex-col justify-between text-[#1C1C1E]">
            <div className="space-y-6 pb-28">
                <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-neutral-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 text-xs text-neutral-500 pl-14 lg:pl-0">
                        <span>Daftar Aset</span>
                        <span className="text-neutral-300">/</span>
                        <span>{attrs.code}</span>
                        <span className="text-neutral-300">/</span>
                        <span className="text-neutral-900 font-semibold">Ubah</span>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold shrink-0 select-none">
                        RS
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-2">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Ubah aset</h1>
                        <p className="text-xs text-neutral-500 mt-0.5">Setiap perubahan dicatat di audit log beserta nilai lama dan baru (FR-UD3).</p>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                            {error}
                        </div>
                    )}

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

                                    {photoError && (
                                        <p className="text-xs text-red-600">{photoError}</p>
                                    )}

                                    <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                                        {photos.length === 0 && (
                                            <p className="text-xs text-neutral-400 italic">Belum ada foto</p>
                                        )}
                                        {photos.map((photo) => (
                                            <div
                                                key={photo.id}
                                                className={`relative h-20 w-24 rounded-xl border-2 overflow-hidden flex items-center justify-center shadow-2xs shrink-0 bg-neutral-100 ${photo.isPrimary ? 'border-amber-400' : 'border-neutral-200'
                                                    }`}
                                            >
                                                <img
                                                    src={photo.url}
                                                    alt={photo.caption ?? 'Foto aset'}
                                                    className="h-full w-full object-cover"
                                                />
                                                {photo.isPrimary && (
                                                    <span className="absolute bottom-1 left-1 rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-neutral-900 shadow-2xs">
                                                        Utama
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeletePhoto(photo.id)}
                                                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-neutral-800/65 text-white flex items-center justify-center text-xs cursor-pointer"
                                                >
                                                    ×
                                                </button>
                                                {!photo.isPrimary && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetPrimary(photo.id)}
                                                        className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-700 shadow-2xs hover:bg-white cursor-pointer"
                                                    >
                                                        Jadikan utama
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 shadow-2xs space-y-3">
                                <h3 className="text-xs font-bold text-neutral-900">Ringkasan perubahan</h3>
                                <div className="text-xs space-y-2 text-neutral-600">
                                    {formData.namaBarang !== attrs.name && (
                                        <div>
                                            <span className="font-semibold text-neutral-700 block">Nama barang</span>
                                            <span className="text-neutral-500">{attrs.name} → {formData.namaBarang}</span>
                                        </div>
                                    )}
                                    {formData.kondisi !== attrs.condition && (
                                        <div>
                                            <span className="font-semibold text-neutral-700 block">Kondisi</span>
                                            <span className="text-neutral-500">{attrs.condition} → {formData.kondisi}</span>
                                        </div>
                                    )}
                                    {formData.status !== attrs.status && (
                                        <div>
                                            <span className="font-semibold text-neutral-700 block">Status</span>
                                            <span className="text-neutral-500">{attrs.status} → {formData.status}</span>
                                        </div>
                                    )}
                                    {Number(formData.jumlah) !== attrs.quantity && (
                                        <div>
                                            <span className="font-semibold text-neutral-700 block">Jumlah</span>
                                            <span className="text-neutral-500">{attrs.quantity} → {formData.jumlah}</span>
                                        </div>
                                    )}
                                    {Number(formData.hargaPerolehan) !== (attrs.acquisitionPrice ?? 0) && (
                                        <div>
                                            <span className="font-semibold text-neutral-700 block">Harga perolehan</span>
                                            <span className="text-neutral-500">{attrs.acquisitionPrice ?? 0} → {formData.hargaPerolehan}</span>
                                        </div>
                                    )}
                                    {formData.namaBarang === attrs.name &&
                                        formData.kondisi === attrs.condition &&
                                        formData.status === attrs.status &&
                                        Number(formData.jumlah) === attrs.quantity &&
                                        Number(formData.hargaPerolehan) === (attrs.acquisitionPrice ?? 0) && (
                                            <p className="text-neutral-400 italic">Belum ada perubahan</p>
                                        )}
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

            <div className="sticky bottom-0 z-20 flex items-center justify-between border-t border-neutral-200/80 bg-white/90 backdrop-blur-md px-6 lg:px-8 py-4 shadow-md">
                <span className="text-xs text-neutral-400">
                    {loading ? 'Menyimpan...' : 'Perubahan belum tersimpan'}
                </span>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 cursor-pointer disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>
        </form>
    )
}