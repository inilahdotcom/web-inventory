import { api } from "@/lib/axios"

export interface ReminderSettings {
  defaultIntervalDays: number
  windowDays: number
  enabled: boolean
}

export interface CategoryInterval {
  id: number
  name: string
  checkIntervalDays: number | null // null = ikuti bawaan
  assetCount: number
}

export interface ReminderSettingsResponse {
  settings: ReminderSettings
  categories: CategoryInterval[]
  schedule: string
}

export interface ReminderPreview {
  dryRun: boolean
  mails: Record<string, string> | null
}

export const reminderService = {
  getSettings: async (): Promise<ReminderSettingsResponse> => {
    const res = await api.get("/reminders/settings")
    return (res.data?.data || res.data) as ReminderSettingsResponse
  },

  updateSettings: async (
    body: ReminderSettings
  ): Promise<ReminderSettingsResponse> => {
    const res = await api.put("/reminders/settings", body)
    return (res.data?.data || res.data) as ReminderSettingsResponse
  },

  setCategoryInterval: async (
    id: number,
    days: number | null
  ): Promise<void> => {
    await api.put(`/reminders/settings/categories/${id}`, {
      checkIntervalDays: days,
    })
  },

  // Dry run: tidak mengirim email apa pun.
  preview: async (): Promise<ReminderPreview> => {
    const res = await api.post("/reminders/run")
    return (res.data?.data || res.data) as ReminderPreview
  },

  // Kirim email pengingat secara manual sekarang ke alamat email tertentu (wajib).
  sendNow: async (
    onlyTo: string
  ): Promise<{ dryRun: boolean; mails: Record<string, string> | null }> => {
    const params = new URLSearchParams()
    params.set("dryRun", "false")
    params.set("onlyTo", onlyTo)
    const res = await api.post(`/reminders/run?${params.toString()}`)
    return res.data?.data || res.data
  },
}
