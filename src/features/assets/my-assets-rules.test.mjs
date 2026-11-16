import assert from "node:assert/strict"
import test from "node:test"
import {
  filterAssetsByHolder,
  getConfirmedMutationHistory,
} from "./my-assets-rules.ts"

function asset(id, holder) {
  return {
    id,
    attributes: {
      holder,
    },
  }
}

test("aset saya hanya memuat pemegang dengan nama yang sama", () => {
  const result = filterAssetsByHolder(
    [asset("1", "Inilah Admin"), asset("2", "Inilah Admin Cadangan")],
    "Inilah Admin"
  )

  assert.deepEqual(
    result.map((item) => item.id),
    ["1"]
  )
})

test("pencocokan pemegang mengabaikan kapital dan spasi berlebih", () => {
  const result = filterAssetsByHolder(
    [asset("1", "  INILAH   ADMIN "), asset("2", null)],
    "Inilah Admin"
  )

  assert.deepEqual(
    result.map((item) => item.id),
    ["1"]
  )
})

test("nama profil kosong tidak menampilkan aset", () => {
  assert.deepEqual(filterAssetsByHolder([asset("1", null)], ""), [])
})

test("riwayat mutasi disembunyikan sebelum pemegang mengonfirmasi", () => {
  const mutationHistory = [{ id: "mutasi-1" }]

  assert.deepEqual(getConfirmedMutationHistory(mutationHistory, null), [])
})

test("riwayat mutasi ditampilkan setelah pemegang mengonfirmasi", () => {
  const mutationHistory = [{ id: "mutasi-1" }]

  assert.deepEqual(
    getConfirmedMutationHistory(mutationHistory, "2026-10-28T10:01:18+07:00"),
    mutationHistory
  )
})
