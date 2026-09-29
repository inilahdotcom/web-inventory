import { useId, useState, type FormEvent, type InputHTMLAttributes } from "react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/Modal"
import type {
  CreateUserPayload,
  ManagedUser,
  UserRole,
  UserStatus,
} from "@/types/user"

export type UserFormValues = CreateUserPayload

interface UserFormDialogProps {
  user?: ManagedUser | null
  busy: boolean
  error: string
  onClose: () => void
  onSubmit: (values: UserFormValues) => Promise<void>
}

const fieldClass =
  "h-10 w-full rounded-lg border border-[#e0e2e8] bg-white px-3 text-sm outline-none focus:border-[#4262ff] focus:ring-2 focus:ring-[#4262ff]/20"

function TextField({
  label,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  id: string
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-xs font-semibold">
      {label}
      <input id={id} className={fieldClass} {...props} />
    </label>
  )
}

export function UserFormDialog({
  user,
  busy,
  error,
  onClose,
  onSubmit,
}: UserFormDialogProps) {
  const id = useId()
  const [values, setValues] = useState<UserFormValues>({
    name: user?.attributes.name ?? "",
    email: user?.attributes.email ?? "",
    phone: user?.attributes.phone ?? "",
    password: "",
    role: user?.attributes.role ?? "staff_ga",
    status: user?.attributes.status ?? "active",
  })

  const update = <K extends keyof UserFormValues>(
    field: K,
    value: UserFormValues[K]
  ) => setValues((current) => ({ ...current, [field]: value }))

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void onSubmit({
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
    })
  }

  return (
    <Modal
      title={user ? "Ubah pengguna" : "Tambah pengguna"}
      onClose={() => {
        if (!busy) onClose()
      }}
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id={`${id}-name`}
            label="Nama lengkap"
            autoComplete="name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            required
            disabled={busy}
          />
          <TextField
            id={`${id}-phone`}
            label="Nomor telepon"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
            disabled={busy}
          />
        </div>
        <TextField
          id={`${id}-email`}
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
          required
          disabled={busy}
        />
        <TextField
          id={`${id}-password`}
          label={user ? "Password baru (opsional)" : "Password"}
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={values.password}
          onChange={(event) => update("password", event.target.value)}
          required={!user}
          disabled={busy}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label htmlFor={`${id}-role`} className="flex flex-col gap-1.5 text-xs font-semibold">
            Peran
            <select
              id={`${id}-role`}
              className={fieldClass}
              value={values.role}
              onChange={(event) => update("role", event.target.value as UserRole)}
              disabled={busy}
            >
              <option value="admin">Admin</option>
              <option value="staff_ga">Staff GA</option>
              <option value="viewer">Viewer</option>
            </select>
          </label>
          <label htmlFor={`${id}-status`} className="flex flex-col gap-1.5 text-xs font-semibold">
            Status
            <select
              id={`${id}-status`}
              className={fieldClass}
              value={values.status}
              onChange={(event) => update("status", event.target.value as UserStatus)}
              disabled={busy}
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </label>
        </div>
        {error && (
          <p role="alert" className="rounded-lg bg-[#fff8e0] px-3 py-2 text-sm text-[#746019]">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={busy}>
            Batal
          </Button>
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? "Menyimpan…" : user ? "Simpan perubahan" : "Tambah pengguna"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
