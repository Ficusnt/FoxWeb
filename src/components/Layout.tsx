import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="fox-shell">
      {/* Top navbar */}
      <nav className="fox-nav flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-2 text-gray-500 hover:text-fox-ink"
          aria-label="Abrir menú"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <a href="/" className="fox-brand">
          FOX
        </a>

        <div className="hidden md:flex items-center gap-8">
          {/* Top navigation is intentionally empty — the Wizard is the landing page */}
        </div>
      </nav>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-fox-rule">
          <div className="flex items-center justify-between h-12 px-6 border-b border-fox-rule">
            <span className="text-lg font-bold text-fox-ink tracking-tight">FOX</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-500 hover:text-fox-ink"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {/* Mobile nav is intentionally empty — the Wizard is the landing page */}
          </nav>
        </aside>
      )}

      {/* Main content */}
      <main className="fox-main">
        {children}
      </main>
    </div>
  )
}
