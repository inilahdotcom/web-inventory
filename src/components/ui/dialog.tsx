import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Context ──────────────────────────────────────────────────────────────────

interface DialogContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialog() {
  const ctx = React.useContext(DialogContext)
  if (!ctx)
    throw new Error("Dialog compound components must be used inside <Dialog>")
  return ctx
}

// ─── Dialog Root ──────────────────────────────────────────────────────────────

interface DialogProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Dialog({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  return (
    <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

// ─── DialogTrigger ────────────────────────────────────────────────────────────

interface DialogTriggerProps {
  children: React.ReactElement<{ onClick?: React.MouseEventHandler }>
  asChild?: boolean
}

function DialogTrigger({ children }: DialogTriggerProps) {
  const { onOpenChange } = useDialog()
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e)
      onOpenChange(true)
    },
  })
}

// ─── DialogPortal ─────────────────────────────────────────────────────────────

function DialogPortal({ children }: { children: React.ReactNode }) {
  const { open } = useDialog()
  if (!open) return null
  return createPortal(children, document.body)
}

// ─── DialogOverlay ────────────────────────────────────────────────────────────

const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { onOpenChange } = useDialog()
  return (
    <div
      ref={ref}
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]",
        "data-[state=closed]:animate-out data-[state=open]:animate-in",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      onClick={() => onOpenChange(false)}
      {...props}
    />
  )
})
DialogOverlay.displayName = "DialogOverlay"

// ─── DialogContent ────────────────────────────────────────────────────────────

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { hideCloseButton?: boolean }
>(({ className, children, hideCloseButton = false, ...props }, ref) => {
  const { onOpenChange } = useDialog()

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onOpenChange])

  return (
    <DialogPortal>
      <DialogOverlay />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          data-slot="dialog-content"
          className={cn(
            "relative w-full max-w-lg rounded-2xl bg-card p-5 text-card-foreground shadow-2xl sm:p-6",
            "animate-in duration-200 fade-in-0 zoom-in-95",
            className
          )}
          onMouseDown={(e) => e.stopPropagation()}
          {...props}
        >
          {children}
          {!hideCloseButton && (
            <button
              type="button"
              aria-label="Tutup"
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 grid size-8 shrink-0 place-items-center rounded-full border border-hairline text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>
    </DialogPortal>
  )
})
DialogContent.displayName = "DialogContent"

// ─── DialogHeader ─────────────────────────────────────────────────────────────

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("mb-5 flex flex-col gap-1 pr-8", className)}
      {...props}
    />
  )
}

// ─── DialogFooter ─────────────────────────────────────────────────────────────

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

// ─── DialogTitle ──────────────────────────────────────────────────────────────

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    data-slot="dialog-title"
    className={cn(
      "text-xl leading-tight font-semibold text-foreground",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

// ─── DialogDescription ────────────────────────────────────────────────────────

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="dialog-description"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

// ─── DialogClose ──────────────────────────────────────────────────────────────

function DialogClose({
  children,
}: {
  children: React.ReactElement<{ onClick?: React.MouseEventHandler }>
}) {
  const { onOpenChange } = useDialog()
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e)
      onOpenChange(false)
    },
  })
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
