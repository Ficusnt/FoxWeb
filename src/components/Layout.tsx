import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top navbar */}
      <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="text-xl font-bold text-gray-900 tracking-tight">FOX</span>
        </div>

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
        <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 md:hidden">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <span className="text-lg font-bold text-gray-900 tracking-tight">FOX</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
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
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}
