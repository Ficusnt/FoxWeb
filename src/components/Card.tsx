import { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  className?: string
  header?: ReactNode
  footer?: ReactNode
}

export default function Card({
  children,
  className,
  header,
  footer,
}: CardProps) {
  return (
    <div
      className={[
        "rounded-xl border border-gray-200 bg-white shadow-sm",
        className,
      ].join(" ")}
    >
      {header && <div className="flex items-center gap-4 p-6 border-b border-gray-100">{header}</div>}
      <div className="p-6">{children}</div>
      {footer && <div className="flex items-center gap-4 p-6 border-t border-gray-100 bg-gray-50">{footer}</div>}
    </div>
  )
}

interface CardHeaderProps {
  title?: string
  description?: string
  icon?: ReactNode
  children?: ReactNode
}

export function CardHeader({ title, description, icon, children }: CardHeaderProps) {
  return (
    <div className="flex items-center gap-4 p-6 border-b border-gray-100">
      {icon && <div className="p-2 rounded-lg bg-gray-100 text-gray-600">{icon}</div>}
      <div>
        {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
        {description && <p className="text-sm text-gray-500">{description}</p>}
        {children && children}
      </div>
    </div>
  )
}

export function CardFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 p-6 border-t border-gray-100 bg-gray-50 justify-end">
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Footer = CardFooter
