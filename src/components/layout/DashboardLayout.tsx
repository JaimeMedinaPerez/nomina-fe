import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'
import {
    LayoutDashboard,
    Users,
    CalendarClock,
    Banknote,
    FileText,
    Files,
    LogOut,
    Menu,
    X
} from 'lucide-react'

export function DashboardLayout() {
    const { user, logout } = useAuthStore()
    const location = useLocation()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const adminLinks = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/employees', label: 'Empleados', icon: Users },
        { href: '/admin/attendance', label: 'Asistencia', icon: CalendarClock },
        { href: '/admin/payroll', label: 'Nómina', icon: Banknote },
        { href: '/admin/permissions', label: 'Permisos', icon: FileText },
        { href: '/admin/documents', label: 'Documentos', icon: Files },
    ]

    const workerLinks = [
        { href: '/worker', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/worker/attendance', label: 'Mi Asistencia', icon: CalendarClock },
        { href: '/worker/payments', label: 'Mis Pagos', icon: Banknote },
        { href: '/worker/permissions', label: 'Permisos', icon: FileText },
        { href: '/worker/documents', label: 'Mis Documentos', icon: Files },
    ]

    const links = user?.role === 'admin' ? adminLinks : workerLinks

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col h-screen",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-border shrink-0">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        NominaSystem
                    </span>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-1 rounded-md hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500/20 hover:scrollbar-thumb-indigo-500/40 scrollbar-track-transparent">
                    {links.map((link) => {
                        const Icon = link.icon
                        const isActive = location.pathname === link.href
                        return (
                            <Link
                                key={link.href}
                                to={link.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={cn(
                                    "group flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden shrink-0",
                                    isActive
                                        ? "bg-indigo-600/10 text-indigo-400"
                                        : "text-slate-400 hover:text-indigo-300 hover:bg-slate-800/50"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full"></div>
                                )}
                                <Icon
                                    size={20}
                                    className={cn(
                                        "transition-transform group-hover:scale-110",
                                        isActive ? "text-indigo-500" : "text-slate-500 group-hover:text-indigo-400"
                                    )}
                                />
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-border/50 shrink-0 bg-card">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group">
                        <div className="relative shrink-0">
                            <img
                                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`}
                                alt="Profile"
                                className="w-8 h-8 rounded-full ring-2 ring-indigo-500/20"
                            />
                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-card"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-indigo-100 truncate leading-tight">
                                {user?.name}
                            </p>
                            <p className="text-[10px] text-indigo-400/80 truncate capitalize">
                                {user?.role === 'worker' ? 'Trabajador' : user?.role}
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Cerrar Sesión"
                        >
                            <LogOut size={14} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 lg:px-8">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-4 ml-auto">
                        {/* Header Actions if needed */}
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
