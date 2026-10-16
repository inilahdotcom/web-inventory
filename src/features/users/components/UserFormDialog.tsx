import { useId, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Select, SelectItem } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
          {/* Nama */}
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-name`}>Nama lengkap</Label>
            <Input
              id={`${id}-name`}
              autoComplete="name"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              required
              disabled={busy}
            />
          </div>

          {/* Telepon */}
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-phone`}>Nomor telepon</Label>
            <Input
              id={`${id}-phone`}
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              disabled={busy}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-email`}>Email</Label>
          <Input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            required
            disabled={busy}
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-password`}>
            {user ? "Password baru (opsional)" : "Password"}
          </Label>
          <Input
            id={`${id}-password`}
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            required={!user}
            disabled={busy}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Peran */}
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-role`}>Peran</Label>
            <Select
              id={`${id}-role`}
              value={values.role}
              onChange={(e) => update("role", e.target.value as UserRole)}
              disabled={busy}
            >
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="staff_ga">Staff GA</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-status`}>Status</Label>
            <Select
              id={`${id}-status`}
              value={values.status}
              onChange={(e) => update("status", e.target.value as UserStatus)}
              disabled={busy}
            >
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Nonaktif</SelectItem>
            </Select>
          </div>
        </div>

        {error && (
          <Alert variant="warning">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={busy}
          >
            Batal
          </Button>
          <Button type="submit" size="sm" disabled={busy}>
            {busy
              ? "Menyimpan…"
              : user
                ? "Simpan perubahan"
                : "Tambah pengguna"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
