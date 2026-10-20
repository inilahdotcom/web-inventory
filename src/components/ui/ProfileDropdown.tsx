/**
 * ProfileDropdown — Komponen dropdown profil user yang reusable.
 * Menampilkan avatar inisial, nama user, aksi navigasi ke profil, dan logout.
 *
 * Usage:
 *   <ProfileDropdown displayName="Dzaki" initials="DZ" onLogout={handleLogout} />
 */

import { useEffect, useRef, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { User, LogOut } from "lucide-react"
import { authService } from "@/services/authServices"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"
import { profileService } from "@/services/profileService"

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

interface ProfileDropdownProps {
  /** Override nama tampilan. Jika tidak diisi, diambil dari query profil. */
  displayName?: string
  /** Override inisial. Jika tidak diisi, dikalkulasi dari displayName. */
  initials?: string
}

export function ProfileDropdown({
  displayName: nameProp,
  initials: initsProp,
}: ProfileDropdownProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ["dashboard", "profile"],
    queryFn: () => profileService.get(),
  })

  const displayName = nameProp ?? profile?.attributes?.name ?? ""
  const initials = initsProp ?? (getInitials(displayName) || "?")

  const handleLogout = async () => {
    setOpen(false)
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Menu profil"
        aria-expanded={open}
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600 transition select-none hover:ring-2 hover:ring-rose-300 focus:outline-none"
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-neutral-200 bg-white py-1.5 shadow-lg ring-1 ring-black/5 focus:outline-none"
        >
          <div className="border-b border-neutral-100 px-4 py-2">
            <p className="truncate text-xs font-semibold text-neutral-900">
              {displayName || "Pengguna"}
            </p>
            <p className="text-[10px] text-neutral-500">Akun Terverifikasi</p>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              void navigate({ to: "/profile" })
            }}
            className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            <User size={14} className="text-neutral-500" />
            Detail Profile
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => void handleLogout()}
            className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut size={14} className="text-rose-500" />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
