import assert from "node:assert/strict"
import test from "node:test"
import { buildAuditTimelineEntries } from "./audit-timeline.ts"

test("timeline menampilkan perubahan field yang bermakna", () => {
  const entries = buildAuditTimelineEntries({
    type: "UPDATE",
    oldValues: {
      brand: "-",
      category: "-",
      location: "-",
      brandId: 0,
      updatedat: "2026-10-21T11:06:50Z",
    },
    newValues: {
      brand: "Ajazz",
      category: "Komputer & Laptop",
      location: "Redaksi Lantai 3",
      brandId: 22,
      updatedat: "2026-10-26T03:26:42Z",
    },
  })

  assert.deepEqual(
    entries.map(({ title, subtitle }) => ({ title, subtitle })),
    [
      { title: "Merek", subtitle: "Kosong → Ajazz" },
      { title: "Kategori", subtitle: "Kosong → Komputer & Laptop" },
      { title: "Lokasi", subtitle: "Kosong → Redaksi Lantai 3" },
    ]
  )
})

test("timeline mengabaikan field teknis dan nilai yang tidak berubah", () => {
  const entries = buildAuditTimelineEntries({
    type: "UPDATE",
    oldValues: { status: "active", categoryId: 1, updatedat: "lama" },
    newValues: { status: "active", categoryId: 2, updatedat: "baru" },
  })

  assert.equal(entries.length, 1)
  assert.equal(entries[0].title, "Aktivitas UPDATE")
})

test("timeline memakai deskripsi untuk log tanpa old dan new values", () => {
  const entries = buildAuditTimelineEntries({
    type: "RESTORE",
    description: "Aset berhasil dipulihkan dari arsip.",
  })

  assert.deepEqual(entries[0], {
    id: "aktivitas",
    title: "Aktivitas RESTORE",
    subtitle: "Aset berhasil dipulihkan dari arsip.",
    meta: "Rekam aktivitas",
  })
})
