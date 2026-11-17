export const ASSET_CONDITIONS = [
  "Bagus",
  "Rusak Ringan",
  "Rusak Berat",
  "Hilang",
] as const

export const ASSET_STATUSES = [
  "Digunakan",
  "Tersedia",
  "Diperbaiki",
  "Dihapuskan",
] as const

export const SPLIT_ASSET_STATUSES = [
  ...ASSET_STATUSES,
  "Tidak Tersedia",
] as const

export type AssetCondition = (typeof ASSET_CONDITIONS)[number]
export type AssetStatus = (typeof ASSET_STATUSES)[number]

/**
 * Daftar transisi status yang sah (Explicit State Machine).
 * Transisi liar seperti "Dihapuskan -> Digunakan" atau "Dihapuskan -> Tersedia" ditolak.
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<string, readonly string[]> = {
  Tersedia: ["Tersedia", "Digunakan", "Diperbaiki", "Dihapuskan"],
  Digunakan: ["Digunakan", "Tersedia", "Diperbaiki", "Dihapuskan"],
  Diperbaiki: ["Diperbaiki", "Tersedia", "Digunakan", "Dihapuskan"],
  Dihapuskan: ["Dihapuskan"], // Terminal state: aset yang sudah dihapuskan tidak boleh diaktifkan kembali secara langsung
}

export const STATUS_TRANSITION_DESCRIPTIONS: Record<string, string> = {
  Tersedia:
    "Dapat dipindahkan ke Digunakan, Diperbaiki, atau Dihapuskan (jika kondisi Bagus/Rusak Ringan).",
  Digunakan:
    "Dapat dikembalikan ke Tersedia, masuk Diperbaiki, atau Dihapuskan.",
  Diperbaiki:
    "Setelah perbaikan selesai dapat kembali ke Tersedia/Digunakan, atau Dihapuskan jika tidak layak.",
  Dihapuskan:
    "Status final (terminal). Aset yang sudah Dihapuskan tidak dapat diubah kembali ke Digunakan, Tersedia, atau Diperbaiki.",
}

/**
 * Memeriksa apakah kombinasi kondisi dan status sesuai aturan domain (BR-07).
 */
export function isStatusCompatibleWithCondition(
  status: string,
  condition: string
): boolean {
  if (condition === "Hilang") {
    return status === "Dihapuskan" || status === "Tidak Tersedia"
  }
  if (condition === "Rusak Berat") {
    return status !== "Digunakan"
  }
  return true
}

/**
 * Mengembalikan daftar status tujuan yang sah dari `currentStatus` dan `condition`.
 */
export function getAllowedNextStatuses(
  currentStatus: string,
  condition: string
): string[] {
  const transitions =
    ALLOWED_STATUS_TRANSITIONS[currentStatus] ?? ASSET_STATUSES

  return transitions.filter((targetStatus) =>
    isStatusCompatibleWithCondition(targetStatus, condition)
  )
}

/**
 * Memvalidasi transisi status & kompatibilitas kondisi.
 * Mengembalikan pesan error string jika tidak sah, atau null jika valid.
 */
export function validateStatusTransition(params: {
  fromStatus: string
  toStatus: string
  condition: string
}): string | null {
  const { fromStatus, toStatus, condition } = params
  const allowedByTransition =
    ALLOWED_STATUS_TRANSITIONS[fromStatus] ?? ASSET_STATUSES

  if (!allowedByTransition.includes(toStatus)) {
    return `Transisi status tidak diizinkan: ${fromStatus} → ${toStatus}. Status ${fromStatus} hanya dapat berubah ke: ${allowedByTransition.join(", ")}.`
  }

  if (!isStatusCompatibleWithCondition(toStatus, condition)) {
    if (condition === "Hilang") {
      return `Aset dengan kondisi Hilang tidak dapat berstatus ${toStatus} (harus Dihapuskan).`
    }
    if (condition === "Rusak Berat") {
      return `Aset dengan kondisi Rusak Berat tidak dapat berstatus Digunakan (BR-07).`
    }
    return `Status ${toStatus} tidak kompatibel dengan kondisi ${condition}.`
  }

  return null
}

/**
 * Menentukan status pengganti yang sah saat pengguna mengubah kondisi aset.
 */
export function resolveStatusForCondition(
  condition: string,
  currentStatus: string,
  originalStatus: string
): string {
  const allowed = getAllowedNextStatuses(originalStatus, condition)
  if (allowed.includes(currentStatus)) {
    return currentStatus
  }
  if (condition === "Hilang") {
    return allowed.includes("Dihapuskan")
      ? "Dihapuskan"
      : (allowed[0] ?? currentStatus)
  }
  if (condition === "Rusak Berat") {
    if (allowed.includes("Diperbaiki")) return "Diperbaiki"
    if (allowed.includes("Tersedia")) return "Tersedia"
  }
  return allowed[0] ?? currentStatus
}

/**
 * Status default dan daftar status sah saat memecah record aset (BR-09).
 */
export function getAllowedSplitStatuses(condition: string): string[] {
  if (condition === "Hilang") {
    return ["Tidak Tersedia"]
  }
  return SPLIT_ASSET_STATUSES.filter(
    (status) =>
      status !== "Dihapuskan" &&
      status !== "Tidak Tersedia" &&
      isStatusCompatibleWithCondition(status, condition)
  )
}

export function defaultSplitStatus(
  condition: string,
  currentStatus: string
): string {
  const allowed = getAllowedSplitStatuses(condition)
  if (condition === "Hilang") return "Tidak Tersedia"
  if (condition === "Rusak Ringan" || condition === "Rusak Berat") {
    return allowed.includes("Diperbaiki") ? "Diperbaiki" : allowed[0]
  }
  return allowed.includes(currentStatus)
    ? currentStatus
    : (allowed[0] ?? "Tersedia")
}
