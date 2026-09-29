import { useEffect, useState } from "react"
import axios from "axios"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/Modal"
import { UserFormDialog, type UserFormValues } from "./UserFormDialog"
import { authStorage } from "@/lib/auth-storage"
import { userService } from "@/services/userService"
import type { ManagedUser, UserRole } from "@/types/user"

const PAGE_SIZE = 25
const tableColumns = "grid-cols-[1fr_16rem_9rem_8rem_11rem_8rem]"
const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  staff_ga: "Staff GA",
  viewer: "Viewer",
}
const permissions = [
  { feature: "Lihat daftar & detail aset", roles: [true, true, true] },
  { feature: "Tambah / ubah aset", roles: [true, true, false] },
  { feature: "Hapus permanen / restore", roles: [true, false, false] },
  { feature: "Import Excel", roles: [true, true, false] },
  { feature: "Export laporan", roles: [true, true, true] },
  { feature: "Kelola master data, pengguna, audit log", roles: [true, false, false] },
] as const

function currentUserId(): number | null {
  const token = authStorage.getAccessToken()
  if (!token) return null
  try {
    const segment = token.split(".")[1]
    const payload = JSON.parse(atob(segment.replace(/-/g, "+").replace(/_/g, "/"))) as {
      id?: unknown
    }
    return typeof payload.id === "number" ? payload.id : null
  } catch {
    return null
  }
}

function errorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown; error?: unknown } | undefined
    const message = data?.message ?? data?.error
    if (typeof message === "string" && message.trim()) return message
    if (error.response?.status === 409) return "Email sudah terdaftar."
  }
  return error instanceof Error && error.message ? error.message : fallback
}

function formatLastLogin(value: string | null): string {
  if (!value) return "Belum pernah"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
}

function UserRow({
  user,
  isCurrentUser,
  busy,
  onEdit,
  onActivate,
  onDeactivate,
}: {
  user: ManagedUser
  isCurrentUser: boolean
  busy: boolean
  onEdit: (user: ManagedUser) => void
  onActivate: (user: ManagedUser) => void
  onDeactivate: (user: ManagedUser) => void
}) {
  const { name, email, role, status, lastLoginAt } = user.attributes
  const inactive = status === "inactive"
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
  const avatarClass = inactive
    ? "bg-[#eef0f3] text-[#8e91a0]"
    : role === "admin"
      ? "bg-[#ffc6c6] text-[#600000]"
      : role === "staff_ga"
        ? "bg-[#c3faf5] text-[#187574]"
        : "bg-[#fff8e0] text-[#746019]"
  const roleClass =
    role === "admin"
      ? "bg-[#1c1c1e] text-white"
      : role === "staff_ga"
        ? "bg-[#f5f3ff] text-[#4262ff]"
        : "border border-[#e0e2e8] bg-white text-[#555a6a]"

  return (
    <div
      className={`grid min-h-16 ${tableColumns} items-center gap-3.5 border-b border-[#eef0f3] px-5 last:border-b-0`}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarClass}`}>
          {initials || "?"}
        </span>
        <span className={`truncate text-sm font-semibold ${inactive ? "text-[#8e91a0]" : ""}`}>
          {name}
        </span>
      </span>
      <span className={`truncate text-xs ${inactive ? "text-[#a5a8b5]" : "text-[#555a6a]"}`}>
        {email}
      </span>
      <span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleClass}`}>
          {roleLabels[role] ?? role}
        </span>
      </span>
      <span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            inactive ? "bg-[#eef0f3] text-[#555a6a]" : "bg-[#c3faf5] text-[#187574]"
          }`}
        >
          {inactive ? "Nonaktif" : "Aktif"}
        </span>
      </span>
      <span className={`text-xs ${inactive ? "text-[#a5a8b5]" : "text-[#555a6a]"}`}>
        {formatLastLogin(lastLoginAt)}
      </span>
      {isCurrentUser ? (
        <span className="text-right text-xs text-[#c7cad5]">Akun Anda</span>
      ) : (
        <span className="flex justify-end gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onEdit(user)}
            disabled={busy}
            className="text-[#4262ff] hover:text-[#2a41b6] disabled:opacity-50"
          >
            Ubah
          </button>
          <button
            type="button"
            onClick={() => (inactive ? onActivate(user) : onDeactivate(user))}
            disabled={busy}
            className={`disabled:opacity-50 ${inactive ? "text-[#4262ff] hover:text-[#2a41b6]" : "text-[#a33d3d] hover:text-[#600000]"}`}
          >
            {busy ? "…" : inactive ? "Aktifkan" : "Nonaktifkan"}
          </button>
        </span>
      )}
    </div>
  )
}

function AccessMatrix() {
  return (
    <section className="flex flex-col gap-3.5 rounded-2xl border border-[#eef0f3] bg-white p-5">
      <h2 className="text-base font-semibold">Matriks hak akses</h2>
      <div className="overflow-x-auto">
        <div className="grid min-w-150 grid-cols-[1fr_7rem_7rem_7rem] text-sm text-[#1c1c1e]">
          {["Fitur", "Admin", "Staff GA", "Viewer"].map((label) => (
            <span
              key={label}
              className={`border-b border-[#e0e2e8] py-2 text-xs font-semibold uppercase tracking-wider text-[#6b6f7e] ${label === "Fitur" ? "" : "text-center"}`}
            >
              {label}
            </span>
          ))}
          {permissions.map(({ feature, roles }, index) => (
            <div key={feature} className="contents">
              <span className={`py-2.5 ${index < permissions.length - 1 ? "border-b border-[#eef0f3]" : ""}`}>
                {feature}
              </span>
              {roles.map((allowed, roleIndex) => (
                <span
                  key={`${feature}-${roleIndex}`}
                  className={`py-2.5 text-center ${allowed ? "text-[#00b473]" : "text-[#c7cad5]"} ${index < permissions.length - 1 ? "border-b border-[#eef0f3]" : ""}`}
                >
                  {allowed ? "✓" : "–"}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function UserManagementView() {
  const queryClient = useQueryClient()
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [cursor, setCursor] = useState("")
  const [previousCursors, setPreviousCursors] = useState<string[]>([])
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)
  const [deactivatingUser, setDeactivatingUser] = useState<ManagedUser | null>(null)
  const [formError, setFormError] = useState("")
  const [busy, setBusy] = useState(false)
  const [busyUserId, setBusyUserId] = useState<number | null>(null)
  const ownId = currentUserId()

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const usersQuery = useQuery({
    queryKey: ["managed-users", search, cursor],
    queryFn: ({ signal }) =>
      userService.list({ search, cursor, pageSize: PAGE_SIZE, sort: "name:asc" }, signal),
    retry: false,
  })

  const resetPage = () => {
    setCursor("")
    setPreviousCursors([])
  }

  const closeForm = () => {
    setCreateOpen(false)
    setEditingUser(null)
    setFormError("")
  }

  const openEdit = async (user: ManagedUser) => {
    setBusyUserId(user.id)
    try {
      const freshUser = await userService.get(user.id)
      setFormError("")
      setEditingUser(freshUser)
    } catch (error) {
      toast.error(errorMessage(error, "Pengguna gagal dimuat."))
    } finally {
      setBusyUserId(null)
    }
  }

  const saveUser = async (values: UserFormValues) => {
    setBusy(true)
    setFormError("")
    try {
      if (editingUser) {
        const { password, ...fields } = values
        await userService.update(editingUser.id, {
          ...fields,
          ...(password ? { password } : {}),
        })
        toast.success("Pengguna berhasil diperbarui.")
      } else {
        await userService.create(values)
        toast.success("Pengguna berhasil ditambahkan.")
      }
      closeForm()
      resetPage()
      await queryClient.invalidateQueries({ queryKey: ["managed-users"] })
    } catch (error) {
      setFormError(errorMessage(error, "Pengguna gagal disimpan. Silakan coba lagi."))
    } finally {
      setBusy(false)
    }
  }

  const activateUser = async (user: ManagedUser) => {
    setBusyUserId(user.id)
    try {
      await userService.update(user.id, { status: "active" })
      toast.success(`${user.attributes.name} berhasil diaktifkan.`)
      resetPage()
      await queryClient.invalidateQueries({ queryKey: ["managed-users"] })
    } catch (error) {
      toast.error(errorMessage(error, "Pengguna gagal diaktifkan."))
    } finally {
      setBusyUserId(null)
    }
  }

  const deactivateUser = async () => {
    if (!deactivatingUser) return
    const user = deactivatingUser
    setBusy(true)
    try {
      await userService.deactivate(user.id)
      setDeactivatingUser(null)
      toast.success(`${user.attributes.name} berhasil dinonaktifkan.`)
      resetPage()
      await queryClient.invalidateQueries({ queryKey: ["managed-users"] })
    } catch (error) {
      toast.error(errorMessage(error, "Pengguna gagal dinonaktifkan."))
    } finally {
      setBusy(false)
    }
  }

  const users = usersQuery.data?.users ?? []
  const activeCount = users.filter((user) => user.attributes.status === "active").length
  const forbidden =
    axios.isAxiosError(usersQuery.error) && usersQuery.error.response?.status === 403

  return (
    <div className="flex min-h-svh min-w-0 flex-col bg-[#f7f8fa] text-[#1c1c1e]">
      <header className="flex h-16 flex-none items-center gap-3.5 border-b border-[#e0e2e8] bg-white pr-4 pl-16 sm:pr-6 lg:px-6">
        <label className="flex h-10 w-full min-w-0 max-w-72 items-center gap-2 rounded-lg border border-[#e0e2e8] bg-[#f7f8fa] px-3">
          <span className="shrink-0 text-sm text-[#a5a8b5]" aria-hidden="true">⌕</span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value)
              resetPage()
            }}
            placeholder="Cari nama atau email…"
            aria-label="Cari nama atau email"
            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[#a5a8b5]"
          />
        </label>
        <Button
          type="button"
          size="sm"
          disabled={forbidden}
          onClick={() => {
            setFormError("")
            setCreateOpen(true)
          }}
          className="ml-auto h-10 shrink-0 bg-[#1c1c1e] px-4 text-white sm:px-5"
        >
          <span className="sm:hidden">+</span>
          <span className="hidden sm:inline">+ Tambah pengguna</span>
        </Button>
      </header>

      <div className="flex flex-1 flex-col gap-5 p-4 sm:px-7 sm:py-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-semibold tracking-tight">Pengguna</h1>
          <p className="text-sm text-[#6b6f7e]">
            {usersQuery.isPending ? "Memuat pengguna…" : `${activeCount} akun aktif di halaman ini`} · otorisasi selalu diperiksa di sisi server, bukan hanya disembunyikan di UI (NFR-07).
          </p>
        </div>

        {usersQuery.isError && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ffc6c6] bg-white px-4 py-3 text-sm text-[#600000]">
            <span>
              {forbidden
                ? "Akses manajemen pengguna hanya tersedia untuk Admin."
                : errorMessage(usersQuery.error, "Daftar pengguna gagal dimuat.")}
            </span>
            {!forbidden && (
              <button type="button" onClick={() => void usersQuery.refetch()} className="font-semibold underline">
                Coba lagi
              </button>
            )}
          </div>
        )}

        {!usersQuery.isError && (
          <section className="overflow-hidden rounded-2xl border border-[#eef0f3] bg-white" aria-label="Daftar pengguna">
            <div className="overflow-x-auto">
              <div className="min-w-250">
                <div className={`grid h-10 ${tableColumns} items-center gap-3.5 border-b border-[#e0e2e8] bg-[#f7f8fa] px-5`}>
                  {["Nama", "Email", "Peran", "Status", "Login terakhir", "Aksi"].map((label) => (
                    <span
                      key={label}
                      className={`text-xs font-semibold uppercase tracking-wider text-[#6b6f7e] ${label === "Aksi" ? "text-right" : ""}`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                {usersQuery.isPending ? (
                  <div className="px-5 py-8 text-sm text-[#6b6f7e]">Memuat daftar pengguna…</div>
                ) : users.length === 0 ? (
                  <div className="px-5 py-8 text-sm text-[#6b6f7e]">
                    {search ? "Tidak ada pengguna yang cocok dengan pencarian." : "Belum ada pengguna."}
                  </div>
                ) : (
                  users.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      isCurrentUser={user.id === ownId}
                      busy={busyUserId === user.id}
                      onEdit={(selected) => void openEdit(selected)}
                      onActivate={(selected) => void activateUser(selected)}
                      onDeactivate={setDeactivatingUser}
                    />
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {!usersQuery.isError && (previousCursors.length > 0 || usersQuery.data?.pagination.hasNextPage) && (
          <nav aria-label="Halaman daftar pengguna" className="flex items-center justify-end gap-3 text-sm">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={previousCursors.length === 0 || usersQuery.isFetching}
              onClick={() => {
                const previous = previousCursors[previousCursors.length - 1]
                setCursor(previous)
                setPreviousCursors((current) => current.slice(0, -1))
              }}
            >
              Sebelumnya
            </Button>
            <span className="text-[#6b6f7e]">Halaman {previousCursors.length + 1}</span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!usersQuery.data?.pagination.hasNextPage || usersQuery.isFetching}
              onClick={() => {
                const next = usersQuery.data?.pagination.nextCursor
                if (!next) return
                setPreviousCursors((current) => [...current, cursor])
                setCursor(next)
              }}
            >
              Berikutnya
            </Button>
          </nav>
        )}

        <AccessMatrix />
      </div>

      {(isCreateOpen || editingUser) && (
        <UserFormDialog
          key={editingUser?.id ?? "create"}
          user={editingUser}
          busy={busy}
          error={formError}
          onClose={closeForm}
          onSubmit={saveUser}
        />
      )}
      {deactivatingUser && (
        <Modal
          title="Nonaktifkan pengguna?"
          onClose={() => {
            if (!busy) setDeactivatingUser(null)
          }}
        >
          <p className="text-sm text-[#555a6a]">
            Akun {deactivatingUser.attributes.name} tidak dapat login setelah dinonaktifkan. Akun dapat diaktifkan kembali dari daftar ini.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={() => setDeactivatingUser(null)}>
              Batal
            </Button>
            <Button type="button" variant="destructive" size="sm" disabled={busy} onClick={() => void deactivateUser()}>
              {busy ? "Memproses…" : "Nonaktifkan"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
