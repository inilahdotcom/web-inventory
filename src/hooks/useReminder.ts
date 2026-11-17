import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  reminderService,
  type ReminderSettings,
} from "@/services/reminderServices"

const KEY = ["reminder", "settings"]

function msg(error: unknown, fallback: string) {
  const e = error as {
    response?: { data?: { error?: string; message?: string } }
  }
  return e.response?.data?.error || e.response?.data?.message || fallback
}

export function useReminderSettings() {
  return useQuery({ queryKey: KEY, queryFn: reminderService.getSettings })
}

export function useUpdateReminderSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ReminderSettings) =>
      reminderService.updateSettings(body),
    onSuccess: () => {
      toast.success("Pengaturan pengingat disimpan")
      void qc.invalidateQueries({ queryKey: KEY })
    },
    onError: (e) => toast.error(msg(e, "Gagal menyimpan pengaturan")),
  })
}

export function useSetCategoryInterval() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: number; days: number | null }) =>
      reminderService.setCategoryInterval(v.id, v.days),
    onSuccess: () => {
      toast.success("Interval kategori disimpan")
      void qc.invalidateQueries({ queryKey: KEY })
    },
    onError: (e) => toast.error(msg(e, "Gagal menyimpan interval kategori")),
  })
}

export function useReminderPreview() {
  return useMutation({
    mutationFn: () => reminderService.preview(),
    onError: (e) => toast.error(msg(e, "Gagal memuat pratinjau")),
  })
}

export function useSendReminderNow() {
  return useMutation({
    mutationFn: (onlyTo: string) => reminderService.sendNow(onlyTo),
    onSuccess: () => {
      toast.success("Email pengingat berhasil dikirim")
    },
    onError: (e) => toast.error(msg(e, "Gagal mengirim email pengingat")),
  })
}
