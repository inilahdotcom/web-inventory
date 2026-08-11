import { useRef, useState } from "react"

type PasswordValues = {
  current: string
  next: string
  confirmation: string
}

export function ProfileView() {
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>()
  const [name, setName] = useState("Rizky Saputra")
  const [passwords, setPasswords] = useState<PasswordValues>({
    current: "",
    next: "",
    confirmation: "",
  })
  const [notice, setNotice] = useState("")

  const updatePassword = (field: keyof PasswordValues, value: string) =>
    setPasswords((current) => ({ ...current, [field]: value }))

  const handlePhotoChange = (file?: File) => {
    if (!file) return

    setAvatarUrl(URL.createObjectURL(file))
    setNotice("Foto profil diperbarui untuk sesi ini.")
  }

  const handlePasswordSave = () => {
    if (!passwords.current || !passwords.next || !passwords.confirmation) {
      setNotice("Lengkapi semua field password terlebih dahulu.")
      return
    }

    if (passwords.next.length < 8) {
      setNotice("Password baru minimal terdiri dari 8 karakter.")
      return
    }

    if (passwords.next !== passwords.confirmation) {
      setNotice("Ulangi password baru harus sama.")
      return
    }

    setPasswords({ current: "", next: "", confirmation: "" })
    setNotice("Password berhasil disimpan. Ini masih simulasi front-end.")
  }

  return (
    <div className="min-h-svh min-w-0 bg-[#f7f8fa] text-[#1c1c1e]">
      <header className="flex h-16 items-center border-b border-[#e0e2e8] bg-white py-0 pr-4 pl-16 text-[13px] text-[#6b6f7e] sm:pr-6 sm:pl-16 lg:pl-6">
        Profil saya
      </header>
      <div className="flex min-h-[calc(100svh-64px)] justify-center bg-[#f7f8fa] p-4 sm:p-7">
        <div className="flex w-full max-w-[820px] flex-col gap-[18px]">
          <section className="flex flex-col gap-4 rounded-[20px] border border-[#eef0f3] bg-white p-5 sm:flex-row sm:items-center sm:gap-[18px] sm:p-[22px]">
            <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-[#ffc6c6] text-[20px] font-semibold text-[#600000]">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Foto profil Rizky Saputra"
                  className="size-full object-cover"
                />
              ) : (
                "RS"
              )}
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[22px] font-semibold tracking-[-0.3px]">
                {name}
              </span>
              <span className="text-[13px] text-[#6b6f7e]">
                rizky.saputra@inc.co.id &middot; Admin GA
              </span>
            </span>
            <ActionButton
              variant="outline"
              className="sm:ml-auto"
              onClick={() => photoInputRef.current?.click()}
            >
              Ganti foto
            </ActionButton>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handlePhotoChange(event.target.files?.[0])}
            />
          </section>

          {notice && (
            <button
              type="button"
              onClick={() => setNotice("")}
              className="rounded-lg bg-[#c3faf5] px-4 py-3 text-left text-[13px] text-[#187574]"
            >
              {notice} &times;
            </button>
          )}

          <section className="flex flex-col gap-[18px] rounded-[20px] border border-[#eef0f3] bg-white p-[22px]">
            <span className="text-[16px] font-semibold">Data akun</span>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ProfileField
                label="Nama lengkap"
                value={name}
                onChange={setName}
              />
              <ProfileField
                label="Email"
                value="rizky.saputra@inc.co.id"
                muted
                readOnly
              />
              <ProfileField
                label="Peran"
                value="Admin — hanya Admin lain yang dapat mengubah"
                muted
                readOnly
              />
              <div className="flex flex-col gap-[6px]">
                <span className="text-[13px] font-semibold">
                  Login terakhir
                </span>
                <span className="flex h-11 items-center text-[14px] text-[#555a6a]">
                  05/08/2026 09.02 &middot; 192.168.1.10
                </span>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-[18px] rounded-[20px] border border-[#eef0f3] bg-white p-[22px]">
            <span className="text-[16px] font-semibold">Ganti password</span>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <PasswordField
                label="Password lama"
                value={passwords.current}
                onChange={(value) => updatePassword("current", value)}
              />
              <PasswordField
                label="Password baru"
                value={passwords.next}
                onChange={(value) => updatePassword("next", value)}
              />
              <PasswordField
                label="Ulangi password baru"
                value={passwords.confirmation}
                onChange={(value) => updatePassword("confirmation", value)}
              />
            </div>
            <div className="flex flex-col gap-[14px] sm:flex-row sm:items-center">
              <span className="text-[12px] text-[#8e91a0]">
                Minimal 8 karakter, kombinasi huruf dan angka. Disimpan sebagai
                hash argon2 (NFR-04).
              </span>
              <ActionButton
                variant="dark"
                className="h-11 px-[22px] text-[14px] sm:ml-auto"
                onClick={handlePasswordSave}
              >
                Simpan password
              </ActionButton>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-[20px] bg-[#fff8e0] p-5 sm:flex-row sm:items-center">
            <span className="flex flex-col gap-1">
              <span className="text-[15px] font-semibold text-[#746019]">
                Sesi aktif
              </span>
              <span className="text-[12.5px] leading-[1.5] text-[#746019]">
                Chrome &middot; Windows 11 &middot; 192.168.1.10 &mdash; sesi
                ini. Berakhir otomatis setelah 60 menit tidak aktif (FR-A02).
              </span>
            </span>
            <ActionButton
              variant="dark"
              className="sm:ml-auto"
              onClick={() => setNotice("Sesi berhasil diakhiri (simulasi).")}
            >
              Keluar
            </ActionButton>
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
  onChange,
}: {
  label: string
  value: string
  muted?: boolean
  readOnly?: boolean
  onChange?: (value: string) => void
}) {
  return (
    <label className="flex flex-col gap-[6px]">
      <span className="text-[13px] font-semibold">{label}</span>
      <input
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        className={`h-11 rounded-lg border px-[14px] text-[14px] outline-none ${muted ? "border-[#e0e2e8] bg-[#f7f8fa] text-[#555a6a]" : "border-[#c7cad5] bg-white"}`}
      />
    </label>
  )
}

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex flex-col gap-[6px]">
      <span className="text-[13px] font-semibold">{label}</span>
      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-[#c7cad5] bg-white px-[14px] text-[15px] tracking-[3px] outline-none"
      />
    </label>
  )
}

function ActionButton({
  children,
  onClick,
  variant,
  className = "",
}: {
  children: string
  onClick: () => void
  variant: "dark" | "outline"
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 w-fit items-center rounded-full px-[17px] text-[13.5px] font-semibold ${variant === "dark" ? "bg-[#1c1c1e] text-white" : "border border-[#c7cad5] bg-white text-[#1c1c1e]"} ${className}`}
    >
      {children}
    </button>
  )
}
