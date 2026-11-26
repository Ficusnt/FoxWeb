import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  FileText,
  Settings,
  Play,
  Home,
  LogOut,
  ChevronRight,
} from "lucide-react"

const NAV_ITEMS = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Datos", href: "/editor", icon: LayoutDashboard },
  { name: "Scraper", href: "/scraper", icon: Settings },
  { name: "Reportes", href: "/opciones", icon: FileText },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const isActive = (path: string) => {
    const { pathname } = window.location
    return pathname === path || (path !== "/" && pathname.startsWith(path))
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 md:fixed`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <span className="text-lg font-bold text-gray-900 tracking-tight">FOX</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.href)
                  setSidebarOpen(false)
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={20} />
                {item.name}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-gray-200">
          <button
            onClick={() => navigate("/")}
            className="w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Home size={20} className="mr-3" />
            Volver al inicio
          </button>
        </div>
      </aside>

      {/* Mobile hamburger */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-lg font-bold text-gray-900 tracking-tight">FOX</span>
        <div className="w-8" />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 md:pl-64">
        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
