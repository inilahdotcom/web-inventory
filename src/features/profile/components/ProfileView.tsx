import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { profileService } from "@/services/profileService"
import { authService } from "@/services/authServices"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Profile } from "@/types/profile"

type PasswordValues = {
  current: string
  next: string
  confirmation: string
}

export function ProfileView() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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
      setError(
        "Password gagal diperbarui. Periksa password lama lalu coba lagi."
      )
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      if (authService?.logout) {
        await authService.logout()
      }
    } catch (err) {
      console.error("Gagal request logout:", err)
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      sessionStorage.clear()

      queryClient.clear()
      toast.success("Berhasil keluar dari akun")
      navigate({ to: "/auth/login" })
    }
  }

  return (
    <div className="min-h-svh min-w-0 bg-[#f7f8fa] text-[#1c1c1e]">
      <header className="flex h-16 items-center border-b border-[#e0e2e8] bg-white py-0 pr-4 pl-16 text-xs text-[#6b6f7e] sm:pr-6 sm:pl-16 lg:pl-6">
        Profil saya
      </header>
      <div className="flex min-h-[calc(100svh-4rem)] justify-center bg-[#f7f8fa] p-4 sm:p-7">
        <div className="flex w-full max-w-205 flex-col gap-4.5">
          <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-4.5 sm:p-5.5">
            <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-[#ffc6c6] text-xl font-semibold text-[#600000]">
              {initials}
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-semibold tracking-tight">
                {isLoading
                  ? "Memuat profil..."
                  : profile?.attributes.name || "-"}
              </span>
              <div className="flex items-center gap-2 text-xs text-[#6b6f7e]">
                <span>{profile ? profile.attributes.email : "-"}</span>
                {profile?.attributes.role && (
                  <Badge
                    variant={
                      profile.attributes.role === "admin"
                        ? "rusak-berat"
                        : "bagus"
                    }
                  >
                    {profile.attributes.role}
                  </Badge>
                )}
              </div>
            </div>
          </Card>

          {notice && (
            <Alert
              variant="success"
              className="cursor-pointer"
              onClick={() => setNotice("")}
            >
              <AlertDescription className="flex items-center justify-between">
                <span>{notice}</span>
                <span className="text-xs font-bold">&times;</span>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert
              variant="destructive"
              className="cursor-pointer"
              onClick={() => setError("")}
            >
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <span className="text-xs font-bold">&times;</span>
              </AlertDescription>
            </Alert>
          )}

          <Card className="flex flex-col gap-4.5 p-5.5">
            <span className="text-base font-semibold">Data akun</span>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="profile-name">Nama lengkap</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading || isSavingProfile}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  value={profile?.attributes.email ?? ""}
                  disabled
                  readOnly
                  className="bg-muted text-muted-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-role">Peran</Label>
                <Input
                  id="profile-role"
                  value={profile?.attributes.role ?? ""}
                  disabled
                  readOnly
                  className="bg-muted text-muted-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-phone">Nomor telepon</Label>
                <Input
                  id="profile-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading || isSavingProfile}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleProfileSave}
                disabled={isLoading || isSavingProfile}
              >
                {isSavingProfile ? "Menyimpan..." : "Simpan profil"}
              </Button>
            </div>
          </Card>

          <Card className="flex flex-col gap-4.5 p-5.5">
            <span className="text-base font-semibold">Ganti password</span>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="pass-current">Password lama</Label>
                <Input
                  id="pass-current"
                  type="password"
                  value={passwords.current}
                  onChange={(e) => updatePassword("current", e.target.value)}
                  disabled={isSavingPassword}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pass-next">Password baru</Label>
                <Input
                  id="pass-next"
                  type="password"
                  value={passwords.next}
                  onChange={(e) => updatePassword("next", e.target.value)}
                  disabled={isSavingPassword}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pass-confirmation">Ulangi password baru</Label>
                <Input
                  id="pass-confirmation"
                  type="password"
                  value={passwords.confirmation}
                  onChange={(e) =>
                    updatePassword("confirmation", e.target.value)
                  }
                  disabled={isSavingPassword}
                />
              </div>
            </div>
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <span className="text-xs text-muted-foreground">
                Minimal 8 karakter, kombinasi huruf dan angka.
              </span>
              <Button
                variant="primary"
                size="md"
                className="sm:ml-auto"
                onClick={handlePasswordSave}
                disabled={isSavingPassword}
              >
                {isSavingPassword ? "Menyimpan..." : "Simpan password"}
              </Button>
            </div>
          </Card>

          {/* Card Sesi Aktif & Logout */}
          <Card className="flex flex-col gap-3 border-[#fce8b3] bg-[#fff8e1] p-5.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-[#5c3c00]">
                Sesi aktif
              </span>
              <span className="text-xs text-[#7c5e10]">
                Chrome - Windows 11 · 127.0.0.1 — sesi ini berakhir otomatis
                setelah 60 menit tidak aktif (FR-A01)
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Keluar..." : "Keluar"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
