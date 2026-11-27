import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  FileText,
  Settings,
  Play,
  Home,
  Menu,
  X,
} from "lucide-react"

const NAV_ITEMS = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Datos", href: "/editor", icon: LayoutDashboard },
  { name: "Scraper", href: "/scraper", icon: Settings },
  { name: "Reportes", href: "/wizard", icon: FileText },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const isActive = (path: string) => {
    const { pathname } = window.location
    return pathname === path || (path !== "/" && pathname.startsWith(path))
  }

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
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
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
              onClick={() => {
                navigate("/")
                setSidebarOpen(false)
              }}
              className="w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Home size={20} className="mr-3" />
              Volver al inicio
            </button>
          </div>
        </aside>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}
