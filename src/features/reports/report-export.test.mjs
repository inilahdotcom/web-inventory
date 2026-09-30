import assert from "node:assert/strict"
import { test } from "node:test"
import ExcelJS from "exceljs"
import { buildPdf, createExportTable, exportExcel } from "./report-export.ts"

const categories = [
  {
    id: 1,
    name: "Komputer & Laptop",
    assetTypes: 2,
    units: 3,
    totalValue: 1500000,
    pricedAssetTypes: 1,
    priceCompletenessPercent: 50,
  },
]

test("rekap laporan memakai angka BE, bukan data contoh", () => {
  const table = createExportTable("Rekap per kategori", categories)
  assert.deepEqual(table.rows, [["Komputer & Laptop", 2, 3, 1500000, "50%"]])
  assert.equal(table.pricedCount, 1)
  assert.equal(table.assetCount, 2)
})

test("empat tab laporan memiliki kolom dan baris ekspor sesuai data", () => {
  const damaged = createExportTable("Aset rusak", [
    {
      code: "001",
      name: "Laptop",
      category: "Komputer",
      brand: null,
      quantity: 1,
      unit: "Unit",
      condition: "Rusak Berat",
      status: "Aktif",
      location: "Studio",
      holder: null,
      purchasePrice: null,
      purchaseDate: null,
    },
  ])
  const location = createExportTable("Per lokasi & pemegang", [
    {
      location: "Studio",
      holder: "Rizky",
      assetTypes: 1,
      units: 2,
      totalValue: 1000,
      pricedAssetTypes: 1,
      priceCompletenessPercent: 100,
    },
  ])
  const movement = createExportTable("Mutasi aset", [
    {
      id: 1,
      assetId: "a",
      code: "001",
      name: "Laptop",
      fromLocation: "Studio",
      toLocation: "Server",
      fromHolder: null,
      toHolder: null,
      movementDate: "2026-08-01T00:00:00Z",
      reason: "Pindah",
      actorName: "Rizky",
    },
  ])
  assert.equal(damaged.rows[0][7], "Belum diisi")
  assert.equal(location.rows[0][5], "100%")
  assert.equal(movement.rows[0][1], "001")
})

test("Excel berisi laporan dan filter yang dipilih", async () => {
  let downloadedBlob
  let downloadedName
  const originalDocument = globalThis.document
  const originalWindow = globalThis.window
  const originalCreateObjectURL = URL.createObjectURL
  globalThis.document = {
    body: { appendChild() {} },
    createElement() {
      return {
        click() {
          downloadedName = this.download
        },
        remove() {},
      }
    },
  }
  globalThis.window = { setTimeout() {} }
  URL.createObjectURL = (blob) => {
    downloadedBlob = blob
    return "blob:test"
  }
  try {
    await exportExcel(
      createExportTable("Rekap per kategori", categories),
      "Rekap per kategori",
      "Agustus 2026",
      "Studio"
    )
    assert.match(downloadedName, /\.xlsx$/)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(await downloadedBlob.arrayBuffer())
    const sheet = workbook.getWorksheet("Laporan")
    assert.equal(
      sheet.getRow(3).getCell(1).value,
      "Periode: Agustus 2026 | Lokasi: Studio"
    )
    assert.equal(sheet.getRow(6).getCell(1).value, "Komputer & Laptop")
  } finally {
    globalThis.document = originalDocument
    globalThis.window = originalWindow
    URL.createObjectURL = originalCreateObjectURL
  }
})

test("PDF yang dibuat memiliki header dan tabel", async () => {
  const doc = await buildPdf(
    createExportTable("Rekap per kategori", categories),
    "Semua",
    "Semua"
  )
  const output = doc.output()
  assert.match(output, /^%PDF-/)
  assert.match(output, /Komputer & Laptop/)
})
