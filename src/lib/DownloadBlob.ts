import type { AxiosResponse } from "axios"

export function downloadBlob(
  response: Blob | AxiosResponse<Blob>,
  fallbackName: string
) {
  const blob = response instanceof Blob ? response : response.data
  const disposition =
    response instanceof Blob
      ? ""
      : String(response.headers?.["content-disposition"] ?? "")

  const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)
  const filename = match ? decodeURIComponent(match[1]) : fallbackName

  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
