import { useEffect, useMemo, useState } from "react"
import { profileService } from "@/services/profileService"
import type { Profile } from "@/types/profile"

type PasswordValues = {
  current: string
  next: string
  confirmation: string
}

export function ProfileView() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [passwords, setPasswords] = useState<PasswordValues>({
    current: "",
    next: "",
    confirmation: "",
  })
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const initials = useMemo(
    () =>
      (profile?.attributes.name || "?")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase(),
    [profile]
  )

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      setIsLoading(true)
      setError("")
      try {
        const data = await profileService.get()
        if (!isMounted) return
        setProfile(data)
        setName(data.attributes.name)
        setPhone(data.attributes.phone ?? "")
      } catch {
        if (isMounted) {
          setError("Profil gagal dimuat. Silakan muat ulang halaman.")
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadProfile()
    return () => {
      isMounted = false
    }
  }, [])

  const updatePassword = (field: keyof PasswordValues, value: string) =>
    setPasswords((current) => ({ ...current, [field]: value }))

  const handleProfileSave = async () => {
    if (!name.trim()) {
      setError("Nama lengkap wajib diisi.")
      return
    }

    setIsSavingProfile(true)
    setError("")
    try {
      const updatedProfile = await profileService.update({
        name: name.trim(),
        phone: phone.trim(),
      })
      setProfile(updatedProfile)
      setName(updatedProfile.attributes.name)
      setPhone(updatedProfile.attributes.phone ?? "")
      setNotice("Data profil berhasil disimpan.")
    } catch {
      setError("Profil gagal disimpan. Silakan coba lagi.")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordSave = async () => {
    if (!passwords.current || !passwords.next || !passwords.confirmation) {
      setError("Lengkapi semua field password terlebih dahulu.")
      return
    }

    if (passwords.next.length < 8) {
      setError("Password baru minimal terdiri dari 8 karakter.")
      return
    }

    if (passwords.next !== passwords.confirmation) {
      setError("Ulangi password baru harus sama.")
      return
    }

    setIsSavingPassword(true)
    setError("")
    try {
      await profileService.changePassword({
        current_password: passwords.current,
        new_password: passwords.next,
        new_password_confirmation: passwords.confirmation,
      })
      setPasswords({ current: "", next: "", confirmation: "" })
      setNotice("Password berhasil diperbarui.")
    } catch {
      setError("Password gagal diperbarui. Periksa password lama lalu coba lagi.")
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="min-h-svh min-w-0 bg-[#f7f8fa] text-[#1c1c1e]">
      <header className="flex h-16 items-center border-b border-[#e0e2e8] bg-white py-0 pr-4 pl-16 text-xs text-[#6b6f7e] sm:pr-6 sm:pl-16 lg:pl-6">
        Profil saya
      </header>
      <div className="flex min-h-[calc(100svh-4rem)] justify-center bg-[#f7f8fa] p-4 sm:p-7">
        <div className="flex w-full max-w-205 flex-col gap-4.5">
          <section className="flex flex-col gap-4 rounded-2xl border border-[#eef0f3] bg-white p-5 sm:flex-row sm:items-center sm:gap-4.5 sm:p-5.5">
            <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-[#ffc6c6] text-xl font-semibold text-[#600000]">
              {initials}
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-2xl font-semibold tracking-tight">
                {isLoading ? "Memuat profil..." : profile?.attributes.name || "-"}
              </span>
              <span className="text-xs text-[#6b6f7e]">
                {profile
                  ? `${profile.attributes.email} · ${profile.attributes.role}`
                  : "-"}
              </span>
            </span>
          </section>

          {notice && (
            <button
              type="button"
              onClick={() => setNotice("")}
              className="rounded-lg bg-[#c3faf5] px-4 py-3 text-left text-xs text-[#187574]"
            >
              {notice} &times;
            </button>
          )}

          {error && (
            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg bg-[#ffe3e3] px-4 py-3 text-left text-xs text-[#a21c1c]"
            >
              {error} &times;
            </button>
          )}

          <section className="flex flex-col gap-4.5 rounded-2xl border border-[#eef0f3] bg-white p-5.5">
            <span className="text-base font-semibold">Data akun</span>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ProfileField
                label="Nama lengkap"
                value={name}
                onChange={setName}
                disabled={isLoading || isSavingProfile}
              />
              <ProfileField
                label="Email"
                value={profile?.attributes.email ?? ""}
                muted
                readOnly
              />
              <ProfileField
                label="Peran"
                value={profile?.attributes.role ?? ""}
                muted
                readOnly
              />
              <ProfileField
                label="Nomor telepon"
                value={phone}
                onChange={setPhone}
                disabled={isLoading || isSavingProfile}
              />
            </div>
            <ActionButton
              variant="dark"
              className="h-11 self-end px-5.5 text-sm"
              onClick={handleProfileSave}
              disabled={isLoading || isSavingProfile}
            >
              {isSavingProfile ? "Menyimpan..." : "Simpan profil"}
            </ActionButton>
          </section>

          <section className="flex flex-col gap-4.5 rounded-2xl border border-[#eef0f3] bg-white p-5.5">
            <span className="text-base font-semibold">Ganti password</span>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <PasswordField
                label="Password lama"
                value={passwords.current}
                onChange={(value) => updatePassword("current", value)}
                disabled={isSavingPassword}
              />
              <PasswordField
                label="Password baru"
                value={passwords.next}
                onChange={(value) => updatePassword("next", value)}
                disabled={isSavingPassword}
              />
              <PasswordField
                label="Ulangi password baru"
                value={passwords.confirmation}
                onChange={(value) => updatePassword("confirmation", value)}
                disabled={isSavingPassword}
              />
            </div>
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <span className="text-xs text-[#8e91a0]">
                Minimal 8 karakter, kombinasi huruf dan angka.
              </span>
              <ActionButton
                variant="dark"
                className="h-11 px-5.5 text-sm sm:ml-auto"
                onClick={handlePasswordSave}
                disabled={isSavingPassword}
              >
                {isSavingPassword ? "Menyimpan..." : "Simpan password"}
              </ActionButton>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
function ProfileField({
  label,
  value,
  muted = false,
  readOnly = false,
  disabled = false,
  onChange,
}: {
  label: string
  value: string
  muted?: boolean
  readOnly?: boolean
  disabled?: boolean
  onChange?: (value: string) => void
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold">{label}</span>
      <input
        value={value}
        readOnly={readOnly}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className={`h-11 rounded-lg border px-3.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60 ${muted ? "border-[#e0e2e8] bg-[#f7f8fa] text-[#555a6a]" : "border-[#c7cad5] bg-white"}`}
      />
    </label>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold">{label}</span>
      <input
        type="password"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-[#c7cad5] bg-white px-3.5 text-sm tracking-widest outline-none disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  )
}

function ActionButton({
  children,
  onClick,
  variant,
  className = "",
  disabled = false,
}: {
  children: string
  onClick: () => void
  variant: "dark" | "outline"
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 w-fit items-center rounded-full px-4 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${variant === "dark" ? "bg-[#1c1c1e] text-white" : "border border-[#c7cad5] bg-white text-[#1c1c1e]"} ${className}`}
    >
      {children}
    </button>
  )
}
