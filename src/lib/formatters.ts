const numberFormatter = new Intl.NumberFormat("id-ID")
const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})
const dateFormatters = new Map<string, Intl.DateTimeFormat>()

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatRupiah(value: number): string {
  return currencyFormatter.format(value)
}

export function formatDate(
  value: string | Date,
  options?: Intl.DateTimeFormatOptions,
  fallback = typeof value === "string" ? value : "—"
): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return fallback

  const key = JSON.stringify(options ?? {})
  let formatter = dateFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("id-ID", options)
    dateFormatters.set(key, formatter)
  }
  return formatter.format(date)
}

// Tanggal YYYY-MM-DD adalah tanggal kalender, bukan waktu UTC.
export function formatDateOnly(
  value: string,
  options?: Intl.DateTimeFormatOptions,
  fallback = value
): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value)
  if (!match) return fallback
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  )
  if (
    date.getFullYear() !== Number(match[1]) ||
    date.getMonth() !== Number(match[2]) - 1 ||
    date.getDate() !== Number(match[3])
  )
    return fallback
  return formatDate(date, options, fallback)
}
