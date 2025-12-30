import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, type UserRole } from '@/store/auth-store'
import { Lock, Mail, Users, Building2, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'

export function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuthStore()
    const [email, setEmail] = useState('')
    const [role, setRole] = useState<UserRole>('worker')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const success = await login(email, password, role)
            if (success) {
                const currentUser = useAuthStore.getState().user;
                if (currentUser) {
                    navigate(currentUser.role === 'admin' ? '/admin' : '/worker');
                }
            }
        } catch (error) {
            console.error("Login error", error);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex bg-black overflow-hidden relative">

            {/* Background Gradients for Mobile/Whole Screen */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"></div>
            </div>

            {/* Left Side - Hero / Image (Desktop Only) */}
            <div className="hidden lg:flex w-1/2 relative z-10 flex-col justify-between p-12 bg-gradient-to-br from-indigo-950/50 to-slate-950/50 backdrop-blur-sm border-r border-white/5">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                            <Building2 className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">NominaSystem</span>
                    </div>
                </div>

                <div className="space-y-6 max-w-lg">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl font-bold text-white leading-tight"
                    >
                        Gestiona tu equipo con <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">eficiencia</span>.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-indigo-200 text-lg"
                    >
                        La plataforma completa para la gestión de nóminas, asistencia y permisos de tus colaboradores.
                    </motion.p>
                </div>

                <div className="flex items-center gap-4 text-sm text-indigo-300/50">
                    <span>© 2025 NominaSystem</span>
                    <span>•</span>
                    <span>v1.0.0 Stable</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl">

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Bienvenido de nuevo</h2>
                            <p className="text-indigo-200/60">Ingresa tus credenciales para acceder</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">

                            {/* Role Selector Segmented Control */}
                            <div className="bg-slate-900/50 p-1 rounded-xl flex border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setRole('worker')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${role === 'worker'
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'text-indigo-300 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Users size={16} />
                                    Trabajador
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('admin')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${role === 'admin'
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'text-indigo-300 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Building2 size={16} />
                                    Administrador
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-indigo-300 mb-1.5 ml-1">
                                        Correo Corporativo
                                    </label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-3.5 text-indigo-400 group-focus-within:text-indigo-200 transition-colors" size={18} />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-indigo-500/20 rounded-xl px-10 py-3 text-white placeholder:text-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                            placeholder={role === 'admin' ? 'admin@empresa.com' : 'usuario@empresa.com'}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-indigo-300 mb-1.5 ml-1">
                                        Contraseña
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3.5 text-indigo-400 group-focus-within:text-indigo-200 transition-colors" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-indigo-500/20 rounded-xl px-10 py-3 text-white placeholder:text-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3.5 text-indigo-400 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <label className="flex items-center gap-2 text-indigo-300 cursor-pointer">
                                    <input type="checkbox" className="rounded border-indigo-500/30 bg-slate-900/50 text-indigo-500 focus:ring-indigo-500/50" />
                                    Recordarme
                                </label>
                                <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Ingresar al Portal
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <p className="mt-8 text-center text-xs text-indigo-500/40">
                        Protected by Enterprise Security • NominaSystem 2025
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
