import type { ReportData, ReportTab } from "@/types/report"

export interface ExportTable {
  title: string
  columns: string[]
  rows: Array<Array<string | number>>
  totalRow?: Array<string | number>
  pricedCount?: number
  assetCount?: number
}

const number = (value: number) => new Intl.NumberFormat("id-ID").format(value)
const date = (value: string) => {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(parsed)
}

export function createExportTable<T extends ReportTab>(
  tab: T,
  data: ReportData[T]
): ExportTable {
  switch (tab) {
    case "Rekap per kategori": {
      const rows = data as ReportData["Rekap per kategori"]
      const totals = rows.reduce(
        (current, row) => ({
          types: current.types + row.assetTypes,
          units: current.units + row.units,
          value: current.value + row.totalValue,
          priced: current.priced + row.pricedAssetTypes,
        }),
        { types: 0, units: 0, value: 0, priced: 0 }
      )
      return {
        title: "Rekap aset per kategori",
        columns: [
          "Kategori",
          "Jenis",
          "Unit",
          "Total nilai (Rp)",
          "Kelengkapan harga",
        ],
        rows: rows.map((row) => [
          row.name,
          row.assetTypes,
          row.units,
          row.totalValue,
          `${number(row.priceCompletenessPercent)}%`,
        ]),
        totalRow: [
          "Total",
          totals.types,
          totals.units,
          totals.value,
          `${totals.types ? Math.round((totals.priced * 100) / totals.types) : 0}%`,
        ],
        pricedCount: totals.priced,
        assetCount: totals.types,
      }
    }
    case "Aset rusak": {
      const rows = data as ReportData["Aset rusak"]
      return {
        title: "Laporan aset rusak",
        columns: [
          "Kode",
          "Nama barang",
          "Kategori",
          "Kondisi",
          "Lokasi",
          "Pemegang",
          "Unit",
          "Harga (Rp)",
        ],
        rows: rows.map((row) => [
          row.code,
          row.name,
          row.category,
          row.condition,
          row.location,
          row.holder ?? "—",
          row.quantity,
          row.purchasePrice ?? "Belum diisi",
        ]),
        pricedCount: rows.filter((row) => row.purchasePrice !== null).length,
        assetCount: rows.length,
      }
    }
    case "Per lokasi & pemegang": {
      const rows = data as ReportData["Per lokasi & pemegang"]
      return {
        title: "Laporan per lokasi & pemegang",
        columns: [
          "Lokasi",
          "Pemegang",
          "Jenis",
          "Unit",
          "Total nilai (Rp)",
          "Kelengkapan harga",
        ],
        rows: rows.map((row) => [
          row.location,
          row.holder,
          row.assetTypes,
          row.units,
          row.totalValue,
          `${number(row.priceCompletenessPercent)}%`,
        ]),
        pricedCount: rows.reduce(
          (total, row) => total + row.pricedAssetTypes,
          0
        ),
        assetCount: rows.reduce((total, row) => total + row.assetTypes, 0),
      }
    }
    case "Mutasi aset": {
      const rows = data as ReportData["Mutasi aset"]
      return {
        title: "Laporan mutasi aset",
        columns: [
          "Tanggal",
          "Kode",
          "Nama barang",
          "Dari",
          "Ke",
          "Alasan",
          "Petugas",
        ],
        rows: rows.map((row) => [
          date(row.movementDate),
          row.code,
          row.name,
          row.fromLocation || "—",
          row.toLocation || "—",
          row.reason,
          row.actorName,
        ]),
      }
    }
  }
}

function filename(tab: ReportTab, extension: string) {
  const slug = tab
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return `laporan-${slug}-${new Date().toISOString().slice(0, 10)}.${extension}`
}

export async function exportExcel(
  table: ExportTable,
  tab: ReportTab,
  period: string,
  location: string
) {
  const { default: ExcelJS } = await import("exceljs")
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Laporan")

  sheet.addRow(["PT. INDONESIA NEWS CENTER"])
  sheet.addRow([table.title])
  sheet.addRow([`Periode: ${period} | Lokasi: ${location}`])
  sheet.addRow([])
  const header = sheet.addRow(table.columns)
  table.columns.forEach((_, index) => {
    const cell = header.getCell(index + 1)
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1C1C1E" },
    }
  })
  const rupiahColumns = table.columns
    .map((column, index) => (column.endsWith("(Rp)") ? index : -1))
    .filter((index) => index >= 0)
  table.rows.forEach((row) => {
    const excelRow = sheet.addRow(row)
    rupiahColumns.forEach((index) => {
      const cell = excelRow.getCell(index + 1)
      if (typeof cell.value === "number") cell.numFmt = "#,##0"
    })
  })
  if (table.assetCount !== undefined) {
    sheet.addRow([])
    sheet.addRow([
      `Kelengkapan harga: ${table.pricedCount ?? 0} dari ${table.assetCount} aset`,
    ])
  }
  sheet.columns.forEach((column, index) => {
    const longest = Math.max(
      table.columns[index]?.length ?? 0,
      ...table.rows.map((row) =>
        typeof row[index] === "number" && rupiahColumns.includes(index)
          ? number(row[index]).length
          : String(row[index] ?? "").length
      )
    )
    column.width = Math.min(Math.max(longest + 3, 14), 42)
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer as ArrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  download(blob, filename(tab, "xlsx"))
}

export async function exportPdf(
  table: ExportTable,
  tab: ReportTab,
  period: string,
  location: string
) {
  const doc = await buildPdf(table, period, location)
  doc.save(filename(tab, "pdf"))
}

export async function buildPdf(
  table: ExportTable,
  period: string,
  location: string
) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ])
  const doc = new jsPDF({
    orientation: table.columns.length > 6 ? "landscape" : "portrait",
  })
  const width = doc.internal.pageSize.getWidth()
  doc.setFillColor(255, 208, 47)
  doc.roundedRect(14, 13, 10, 10, 2, 2, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.text("GA", 19, 19.5, { align: "center" })
  doc.setFontSize(12)
  doc.text("PT. INDONESIA NEWS CENTER", 28, 17)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text("General Affairs", 28, 22)
  doc.setDrawColor(224, 226, 232)
  doc.line(14, 27, width - 14, 27)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(15)
  doc.text(table.title, 14, 37)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text(`Periode: ${period}  |  Lokasi: ${location}`, 14, 43)

  autoTable(doc, {
    startY: 49,
    head: [table.columns],
    body: table.rows.map((row) =>
      row.map((cell) => (typeof cell === "number" ? number(cell) : cell))
    ),
    foot: table.totalRow
      ? [
          table.totalRow.map((cell) =>
            typeof cell === "number" ? number(cell) : cell
          ),
        ]
      : undefined,
    showFoot: "lastPage",
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2.5,
      overflow: "linebreak",
    },
    headStyles: { fillColor: [28, 28, 30], textColor: [255, 255, 255] },
    footStyles: { fillColor: [28, 28, 30], textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 },
  })

  let endY =
    (doc as typeof doc & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? 49
  if (table.assetCount !== undefined) {
    endY += 9
    if (endY > doc.internal.pageSize.getHeight() - 35) {
      doc.addPage()
      endY = 18
    }
    doc.setFontSize(9)
    doc.text(
      `Kelengkapan harga: ${table.pricedCount ?? 0} dari ${table.assetCount} aset.`,
      14,
      endY
    )
  }

  const signatureY = Math.max(endY + 24, doc.internal.pageSize.getHeight() - 33)
  if (signatureY > doc.internal.pageSize.getHeight() - 15) doc.addPage()
  const y =
    signatureY > doc.internal.pageSize.getHeight() - 15 ? 25 : signatureY
  doc.setFontSize(8)
  doc.text("Dibuat oleh,", 14, y)
  doc.text("Disetujui,", width - 62, y)
  doc.text("Staff GA", 14, y + 18)
  doc.text("Kepala GA", width - 62, y + 18)
  return doc
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
