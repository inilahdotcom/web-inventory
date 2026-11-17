import assert from "node:assert/strict"
import test from "node:test"
import {
  formatDate,
  formatDateOnly,
  formatNumber,
  formatRupiah,
} from "./formatters.ts"

test("formatter angka dan rupiah memakai locale Indonesia", () => {
  assert.equal(formatNumber(25000000), "25.000.000")
  assert.match(formatRupiah(25000000), /^Rp\s*25\.000\.000$/u)
})

test("tanggal kalender tetap pada hari yang sama dan input tidak valid tetap aman", () => {
  assert.equal(formatDateOnly("2026-11-12"), "12/11/2026")
  assert.equal(formatDateOnly("2026-02-30"), "2026-02-30")
  assert.equal(formatDate("invalid", undefined, "—"), "—")
})
