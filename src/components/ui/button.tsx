import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm sm:text-base font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 select-none touch-manipulation cursor-pointer",
  {
    variants: {
      variant: {
          default: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 border-2 border-blue-400/50 hover:border-blue-300",
        destructive: "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 shadow-red-500/30 border-2 border-red-400/50 hover:border-red-300",
        outline: "border-2 border-white/50 bg-white/80 backdrop-blur-sm hover:bg-white/90 hover:border-white/70 text-gray-700 shadow-white/30 hover:shadow-white/50",
        secondary: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300 shadow-gray-400/30 border-2 border-gray-300/50 hover:border-gray-200",
        ghost: "hover:bg-white/20 hover:text-white text-white/80 border-2 border-transparent hover:border-white/30",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 shadow-none border-none",
        solid: "bg-yellow-200 hover:bg-yellow-300 text-yellow-900 border-2 border-yellow-300 hover:border-yellow-400 shadow-lg hover:shadow-xl",
      },
      size: {
        default: "h-12 sm:h-14 px-6 py-3 text-sm sm:text-base",
        sm: "h-10 sm:h-11 rounded-xl px-4 text-xs sm:text-sm",
        lg: "h-14 sm:h-16 rounded-xl px-8 text-base sm:text-lg font-bold",
        icon: "h-10 w-10 sm:h-12 sm:w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const rest = { ...props };
    if ('jsx' in rest) {
      delete rest.jsx;
    }
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...rest}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
