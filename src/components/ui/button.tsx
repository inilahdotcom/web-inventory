import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium leading-[1.3] whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "rounded-full bg-primary text-primary-foreground hover:bg-[color-mix(in_oklab,var(--primary)_90%,white_10%)] active:bg-[var(--primary-pressed,#2c2c34)] disabled:bg-hairline disabled:text-muted-foreground",
        yellow:
          "rounded-full bg-brand-yellow text-brand-yellow-foreground hover:bg-[color-mix(in_oklab,var(--brand-yellow)_92%,black_8%)] active:bg-[color-mix(in_oklab,var(--brand-yellow)_85%,black_15%)] disabled:bg-hairline disabled:text-muted-foreground",
        blue: "rounded-full bg-brand-blue text-brand-blue-foreground hover:bg-[color-mix(in_oklab,var(--brand-blue)_92%,black_8%)] active:bg-[color-mix(in_oklab,var(--brand-blue)_85%,black_15%)] disabled:bg-hairline disabled:text-muted-foreground",
        secondary:
          "rounded-full border border-hairline-strong bg-transparent text-foreground hover:bg-muted active:bg-[color-mix(in_oklab,var(--muted)_80%,black_20%)] disabled:border-hairline disabled:text-muted-foreground",
        "on-dark":
          "rounded-full bg-white text-primary hover:bg-white/90 active:bg-white/80 disabled:bg-white/40 disabled:text-primary/50",
        ghost:
          "rounded-md bg-transparent text-foreground hover:bg-muted active:bg-[color-mix(in_oklab,var(--muted)_80%,black_20%)] disabled:text-muted-foreground",
        link: "h-auto rounded-none bg-transparent p-0 text-brand-blue underline-offset-4 hover:underline disabled:text-muted-foreground disabled:no-underline",
        destructive:
          "rounded-full bg-[#600000] text-white hover:bg-[color-mix(in_oklab,#600000_90%,white_10%)] active:bg-[color-mix(in_oklab,#600000_80%,black_20%)] disabled:bg-hairline disabled:text-muted-foreground",
      },
      size: {
        sm: "h-9 px-4 text-[13px]",
        md: "h-11 px-6 py-3",
        lg: "h-12 px-7 text-[15px]",
        icon: "size-9 rounded-full border border-hairline bg-card p-0 text-foreground",
        "icon-sm": "size-8 rounded-full border border-hairline bg-card p-0 text-foreground",
        "icon-lg":
          "size-11 rounded-full border border-hairline bg-card p-0 text-foreground",
      },
    },
    compoundVariants: [
      { variant: "ghost", size: "md", className: "h-auto px-3 py-2" },
      { variant: "ghost", size: "sm", className: "h-auto px-2.5 py-1.5" },
      { variant: "link", size: ["sm", "md", "lg"], className: "h-auto px-0 py-0" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
