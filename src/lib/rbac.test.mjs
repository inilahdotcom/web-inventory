import assert from "node:assert/strict"
import { test } from "node:test"
import { ADMIN_ROLES, ASSET_WRITE_ROLES, hasAllowedRole } from "./rbac.ts"

test("route admin hanya menerima role admin", () => {
  assert.equal(hasAllowedRole("admin", ADMIN_ROLES), true)
  assert.equal(hasAllowedRole("staff_ga", ADMIN_ROLES), false)
  assert.equal(hasAllowedRole("viewer", ADMIN_ROLES), false)
})

test("route penulisan aset menerima Admin dan Staff GA", () => {
  assert.equal(hasAllowedRole("ADMIN", ASSET_WRITE_ROLES), true)
  assert.equal(hasAllowedRole(" staff_ga ", ASSET_WRITE_ROLES), true)
  assert.equal(hasAllowedRole("viewer", ASSET_WRITE_ROLES), false)
  assert.equal(hasAllowedRole(undefined, ASSET_WRITE_ROLES), false)
})
