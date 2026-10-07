import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/button"

interface SessionExpiredModalProps {
  isOpen: boolean
  onConfirm: () => void
}

export function SessionExpiredModal({
  isOpen,
  onConfirm,
}: SessionExpiredModalProps) {
  if (!isOpen) return null

  return (
    <Modal title="Sesi Berakhir" onClose={onConfirm}>
      <div className="space-y-4 text-center">
        {/* Icon Peringatan */}
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <svg
            className="size-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <p className="text-sm text-neutral-500">
          Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan masuk
          kembali untuk melanjutkan.
        </p>

        <div className="pt-2">
          <Button
            onClick={onConfirm}
            className="w-full bg-neutral-900 text-white hover:bg-neutral-800"
          >
            Masuk Kembali
          </Button>
        </div>
      </div>
    </Modal>
  )
}
