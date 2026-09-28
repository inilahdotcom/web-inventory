import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { InputField } from '@/components/ui/InputField'
import { SelectedField } from '@/components/ui/SelectedField'
import { assetService, type CreateAssetPayload } from '@/services/assetServices'
import { masterDataService, type MasterDataItem } from '@/services/masterDataService'
import { toast } from "sonner"

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
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    namaBarang: '',
    kategori: '',
    merek: '',
    jumlah: 1,
    satuan: 'Unit',
    kondisi: 'Bagus',
    status: 'Digunakan',
    hargaPerolehan: '',
    tanggalPerolehan: '',
    lokasi: '',
    pemegangAset: '',
    keterangan: '',
    kodeAset: '',
  })

  const [categories, setCategories] = useState<MasterDataItem[]>([])
  const [brands, setBrands] = useState<MasterDataItem[]>([])
  const [locations, setLocations] = useState<MasterDataItem[]>([])
  const [loadingMasterData, setLoadingMasterData] = useState(true)

  const [fotos, setFotos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [warningMessage, setWarningMessage] = useState('')

  const [selectedPhotoIndexForPrimary, setSelectedPhotoIndexForPrimary] = useState<number | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatNumber = new Intl.NumberFormat("id-ID")
  const rupiahInput = (value: string) => {
    if (!value) return ""
    const cleanNumber = value.replace(/\D/g, "")
    return cleanNumber ? `Rp. ${formatNumber.format(Number(cleanNumber))}` : ""
  }
  const numericValue = (value: string) => value.replace(/\D/g, "")

  useEffect(() => {
    let isMounted = true

    const fetchMasterData = async () => {
      setLoadingMasterData(true)
      try {
        const [cats, brds, locs] = await Promise.all([
          masterDataService.getCategories().catch(() => []),
          masterDataService.getBrands().catch(() => []),
          masterDataService.getLocations().catch(() => []),
        ])

        if (!isMounted) return

        setCategories(Array.isArray(cats) ? cats : [])
        setBrands(Array.isArray(brds) ? brds : [])
        setLocations(Array.isArray(locs) ? locs : [])
      } catch (err) {
        console.error('Gagal mengambil data master:', err)
      } finally {
        if (isMounted) {
          setLoadingMasterData(false)
        }
      }
    }

    fetchMasterData()

    return () => {
      isMounted = false
    }
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
        toast.error('Maksimal 5 foto aset!')
      }
    }
  }

  const handleRemovePhoto = (indexToRemove: number) => {
    setFotos((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleConfirmSetPrimary = () => {
    if (selectedPhotoIndexForPrimary !== null && selectedPhotoIndexForPrimary > 0) {
      setFotos((prev) => {
        const newFotos = [...prev]
        const [targetPhoto] = newFotos.splice(selectedPhotoIndexForPrimary, 1)
        newFotos.unshift(targetPhoto)
        return newFotos
      })
      toast.success('Foto utama berhasil diubah!')
    }
    setSelectedPhotoIndexForPrimary(null)
  }

  const handleSubmit = async (e: React.FormEvent, keepAdding: boolean = false) => {
    e.preventDefault()

    if (!formData.namaBarang.trim()) {
      setErrorMessage('Nama barang wajib diisi!')
      return
    }

    if (!formData.kategori) {
      setErrorMessage('Kategori aset wajib dipilih!')
      return
    }

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
        category_id: Number(formData.kategori),
        brand_id: formData.merek ? Number(formData.merek) : undefined,
        quantity: Math.max(1, Number(formData.jumlah) || 1),
        unit: MAP_SATUAN[formData.satuan] || 'Unit',
        condition: MAP_KONDISI[formData.kondisi] || 'Bagus',
        status: MAP_STATUS[formData.status] || 'Digunakan',
        purchase_price: formData.hargaPerolehan ? Number(formData.hargaPerolehan) : undefined,
        purchase_date: formData.tanggalPerolehan || undefined,
        location_id: formData.lokasi ? Number(formData.lokasi) : undefined,
        holder_name: formData.pemegangAset || undefined,
        notes: formData.keterangan || undefined,
        asset_code: formData.kodeAset || undefined,
        photo_urls: photoUrls,
      }

      const res = await assetService.createAsset(payload)

      queryClient.invalidateQueries({ queryKey: ['assets'] })

      if (res.warning) {
        setWarningMessage(res.warning)
      }

      // Ambil kode aset yang baru dibuat dari respons server atau fallback ke input form
      const createdCode = res.code || res.asset_code || formData.kodeAset

      if (keepAdding) {
        setFormData((prev) => ({
          ...prev,
          namaBarang: '',
          keterangan: '',
          pemegangAset: '',
          kodeAset: '',
          kategori: '',
          merek: '',
          lokasi: '',
        }))
        setFotos([])
        toast.success('Aset berhasil disimpan!', {
          description: 'Silakan tambah aset berikutnya.',
        })
      } else {
        toast.success('Aset berhasil disimpan!')
        navigate({
          to: '/asset',
          search: {
            highlight: createdCode,
          },
        })
      }
    } catch (error: any) {
      console.error('Gagal menyimpan aset:', error)

      const rawMsg: string = error.response?.data?.message || error.response?.data?.error || ''
      let userFriendlyMsg = 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.'

      if (rawMsg.includes("failed on the 'min' tag") || rawMsg.includes("min")) {
        userFriendlyMsg = 'Jumlah barang minimal harus 1 unit!'
      } else if (rawMsg.includes("failed on the 'required' tag")) {
        if (rawMsg.includes("'Name'")) {
          userFriendlyMsg = 'Nama barang wajib diisi!'
        } else if (rawMsg.includes("'Category'")) {
          userFriendlyMsg = 'Kategori aset wajib dipilih!'
        } else if (rawMsg.includes("'Quantity'")) {
          userFriendlyMsg = 'Jumlah barang wajib diisi!'
        } else {
          userFriendlyMsg = 'Mohon lengkapi semua field yang wajib diisi (*).'
        }
      } else if (rawMsg.includes('asset_photos') || rawMsg.includes('upload')) {
        userFriendlyMsg = 'Gagal memproses foto aset. Pastikan format file sesuai (JPG/PNG/WEBP).'
      } else if (rawMsg.includes('nomor urut kode aset sudah pernah digunakan')) {
        userFriendlyMsg = 'Nomor urut kode aset ini sudah pernah dipakai sebelumnya.'
      } else if (rawMsg.includes('Duplicate entry') || rawMsg.includes('asset_code')) {
        userFriendlyMsg = 'Kode aset sudah digunakan. Silakan gunakan kode aset lain.'
      } else if (rawMsg.includes('foreign key constraint fails')) {
        userFriendlyMsg = 'Kategori, Merek, atau Lokasi yang dipilih tidak valid.'
      } else if (rawMsg && !rawMsg.includes('Field validation')) {
        userFriendlyMsg = rawMsg
      }

      setErrorMessage(userFriendlyMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      const validFiles = droppedFiles.filter(file => ['image/png', 'image/jpeg', 'image/webp'].includes(file.type))

      if (validFiles.length > 0) {
        if (fotos.length + validFiles.length <= 5) {
          setFotos((prev) => [...prev, ...validFiles])
        } else {
          toast.error('Maksimal 5 foto aset!')
        }
      } else {
        toast.error('Format file tidak didukung! Gunakan JPG, PNG, atau WEBP.')
      }
      e.dataTransfer.clearData()
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

          {errorMessage && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

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
                  placeholder="Masukan nama barang"
                  onChange={handleChange}
                  disabled={loading}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <SelectedField
                      label="Kategori *"
                      name="kategori"
                      value={formData.kategori}
                      onChange={handleChange}
                      disabled={loading}
                      className="bg-white"
                      options={[
                        { label: loadingMasterData ? 'Memuat data...' : 'Pilih salah satu...', value: '' },
                        ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
                      ]}
                    />
                  </div>

                  {/* MEREK */}
                  <div className="space-y-1">
                    <SelectedField
                      label="Merek"
                      name="merek"
                      value={formData.merek}
                      onChange={handleChange}
                      disabled={loading}
                      className="bg-white"
                      options={[
                        { label: loadingMasterData ? 'Memuat data...' : 'Pilih salah satu...', value: '' },
                        ...brands.map((b) => ({ label: b.name, value: String(b.id) })),
                      ]}
                    />
                  </div>
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
                          className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition cursor-pointer ${
                            formData.satuan === item
                              ? 'bg-neutral-900 text-white shadow-2xs'
                              : 'text-neutral-600 hover:text-neutral-900'
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
                        className={`rounded-full px-4 py-1 text-xs font-medium border cursor-pointer transition ${
                          formData.kondisi === kondisi
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
                        className={`rounded-full px-4 py-1 text-xs font-medium border cursor-pointer transition ${
                          formData.status === status
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
                    value={rupiahInput(formData.hargaPerolehan)}
                    onChange={(e) => {
                      const rawNumber = numericValue(e.target.value)
                      setFormData((prev) => ({ ...prev, hargaPerolehan: rawNumber }))
                    }}
                    disabled={loading}
                    placeholder="Masukan angka harga"
                    helperText="Ketik nominal angka, format Rp. otomatis disesuaikan."
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
                  {/* LOKASI */}
                  <div className="space-y-1">
                    <SelectedField
                      label="Lokasi"
                      name="lokasi"
                      value={formData.lokasi}
                      onChange={handleChange}
                      disabled={loading}
                      className="bg-white"
                      options={[
                        { label: loadingMasterData ? 'Memuat data...' : 'Pilih salah satu...', value: '' },
                        ...locations.map((l) => ({ label: l.name, value: String(l.id) })),
                      ]}
                    />
                  </div>

                  <InputField
                    label="Pemegang aset"
                    name="pemegangAset"
                    value={formData.pemegangAset}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Masukan nama karyawan atau tim"
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

                <label
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-6 text-center space-y-1 cursor-pointer hover:bg-indigo-50/50 transition"
                >
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
                    <div 
                      key={index} 
                      onClick={() => {
                        if (index !== 0) {
                          setSelectedPhotoIndexForPrimary(index)
                        }
                      }}
                      className={`relative aspect-square rounded-xl border bg-neutral-100 overflow-hidden flex items-center justify-center shadow-2xs transition ${
                        index !== 0 ? 'cursor-pointer hover:ring-2 hover:ring-neutral-400 border-neutral-200' : 'border-amber-400 ring-2 ring-amber-300'
                      }`}
                      title={index !== 0 ? "Klik untuk jadikan foto utama" : "Foto utama"}
                    >
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
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemovePhoto(index)
                        }}
                        disabled={loading}
                        className="absolute top-1 right-2 text-neutral-400 hover:text-neutral-700 text-base font-normal transition cursor-pointer"
                        title="Hapus foto"
                      >
                        &times;
                      </button>
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

                <p className="text-[10px] text-neutral-400">Foto pertama otomatis jadi foto utama (BR-10). Klik foto lain untuk menjadikannya foto utama.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedPhotoIndexForPrimary !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-neutral-900">Jadikan Foto Utama?</h3>
            <p className="text-xs text-neutral-500">
              Apakah anda yakin akan menjadikan foto ini sebagai foto utama aset?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPhotoIndexForPrimary(null)}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSetPrimary}
                className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 cursor-pointer shadow-xs"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sticky bottom-0 z-20 flex flex-col sm:flex-row items-center justify-between border-t border-neutral-200/80 bg-white/90 backdrop-blur-md px-6 lg:px-8 py-4 shadow-md gap-4">
        <span className="text-xs text-neutral-400">Perubahan belum tersimpan</span>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => navigate({ to: '/asset' })}
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