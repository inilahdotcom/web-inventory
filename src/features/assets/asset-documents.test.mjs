import assert from "node:assert/strict"
import { test } from "node:test"
import {
  MAX_DOCUMENT_SIZE,
  documentPreviewKind,
  validateAssetDocument,
  warrantyDueState,
} from "./asset-documents.ts"

test("validasi membatasi format, ukuran, dan tanggal kartu garansi", () => {
  assert.equal(
    validateAssetDocument({ type: "text/plain", size: 10 }, "invoice", ""),
    "Format file harus PDF, JPG, PNG, atau WEBP."
  )
  assert.equal(
    validateAssetDocument(
      { type: "application/pdf", size: MAX_DOCUMENT_SIZE + 1 },
      "invoice",
      ""
    ),
    "Ukuran file maksimal 10 MB."
  )
  assert.equal(
    validateAssetDocument(
      { type: "application/pdf", size: 10 },
      "warranty",
      ""
    ),
    "Tanggal akhir garansi wajib diisi."
  )
})

test("status garansi membedakan aktif, segera berakhir, dan berakhir", () => {
  const today = new Date("2026-11-10T12:00:00")
  assert.equal(warrantyDueState("2027-01-01", today), "active")
  assert.equal(warrantyDueState("2026-11-30", today), "due")
  assert.equal(warrantyDueState("2026-11-09", today), "expired")
})

test("preview membedakan gambar dan PDF", () => {
  assert.equal(documentPreviewKind("image/png"), "image")
  assert.equal(documentPreviewKind("image/webp"), "image")
  assert.equal(documentPreviewKind("application/pdf"), "pdf")
})
