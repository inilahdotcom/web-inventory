/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-[#ffc6c6] text-[#600000]",
        outline: "border-hairline text-foreground",
        // Status kondisi aset
        bagus: "border-transparent bg-[#c3faf5] text-[#187574]",
        "rusak-ringan": "border-transparent bg-[#fff8e0] text-[#746019]",
        "rusak-berat": "border-transparent bg-[#ffc6c6] text-[#600000]",
        hilang: "border-transparent bg-[#e0e2e8] text-[#555a6a]",
        diperbaiki: "border-transparent bg-[#fde0f0] text-[#7c1752]",
        // Status pengguna
        active: "border-transparent bg-[#c3faf5] text-[#187574]",
        inactive: "border-transparent bg-[#e0e2e8] text-[#555a6a]",
        // Warning
        warning: "border-transparent bg-[#fff8e0] text-[#746019]",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
