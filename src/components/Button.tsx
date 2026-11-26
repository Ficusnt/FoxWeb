import { MouseEventHandler } from "react"

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"

type ButtonSize = "default" | "sm" | "lg" | "icon" | "full"

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const buttonStyles: Record<ButtonVariant, string> = {
  default: "bg-accent text-white hover:bg-accentDark",
  destructive: "bg-red-500 text-white hover:bg-red-600",
  outline: "border border-gray-300 bg-white hover:bg-gray-50",
  secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
  ghost: "hover:bg-gray-100",
  link: "text-accent underline-offset-4 hover:underline",
}

const buttonSizes: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-9 rounded-md px-3 text-sm",
  lg: "h-11 rounded-md px-8 text-base",
  icon: "h-10 w-10",
  full: "w-full",
}

export default function Button({
  className,
  variant = "default",
  size = "default",
  onClick,
  children,
  ...props
}: ButtonProps) {
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    onClick?.(e)
  }

  return (
    <button
      className={[
        "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        buttonStyles[variant],
        buttonSizes[size],
        className,
      ].join(" ")}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}
