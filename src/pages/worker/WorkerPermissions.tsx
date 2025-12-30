import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore, type PermissionType } from '@/store/permissions-store'
import { Plus, Check, Clock, XCircle, X, Calendar, User, Stethoscope, Palmtree } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function WorkerPermissions() {
    const { user } = useAuthStore()
    const { addRequest, getUserRequests } = usePermissionsStore()
    const requests = user ? getUserRequests(user.id) : []

    const [isOpen, setIsOpen] = useState(false)
    const [formData, setFormData] = useState({
        type: 'vacation' as PermissionType,
        startDate: '',
        endDate: '',
        reason: ''
    })

    useEffect(() => {
        usePermissionsStore.getState().fetchRequests()
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        addRequest({
            userId: user.id,
            userName: user.name,
            ...formData
        })
        setIsOpen(false)
        setFormData({ type: 'vacation', startDate: '', endDate: '', reason: '' })
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'vacation': return <Palmtree size={24} />;
            case 'sick': return <Stethoscope size={24} />;
            default: return <User size={24} />;
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'vacation': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
            case 'sick': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
            default: return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Mis Solicitudes</h1>
                    <p className="text-indigo-300 mt-1">Gestiona tus permisos y vacaciones</p>
                </div>
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 font-medium"
                >
                    <Plus size={20} />
                    Nueva Solicitud
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="bg-[#0f102a] border border-indigo-500/20 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-24 bg-indigo-500/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"></div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Calendar size={20} /></span>
                                Solicitar Permiso
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Tipo de Permiso</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'vacation', label: 'Vacaciones', icon: Palmtree },
                                            { id: 'sick', label: 'Salud', icon: Stethoscope },
                                            { id: 'personal', label: 'Personal', icon: User }
                                        ].map((option) => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: option.id as PermissionType })}
                                                className={cn(
                                                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-sm font-medium",
                                                    formData.type === option.id
                                                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                                )}
                                            >
                                                <option.icon size={20} />
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Desde</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Hasta</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Motivo</label>
                                    <textarea
                                        required
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors h-24 placeholder:text-gray-600 resize-none"
                                        placeholder="Describe brevemente el motivo..."
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-medium transition-colors shadow-lg shadow-indigo-500/20"
                                    >
                                        Enviar Solicitud
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {requests.length === 0 ? (
                <div className="text-center py-20 bg-card/30 rounded-3xl border border-white/5 border-dashed">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                        <FileText size={40} className="opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Sin solicitudes</h3>
                    <p className="text-indigo-300/60 max-w-sm mx-auto">Tus solicitudes de permisos aparecerán aquí.</p>
                </div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                    {requests.map(req => (
                        <motion.div
                            key={req.id}
                            variants={item}
                            className="bg-card/40 hover:bg-card/60 border border-white/5 hover:border-indigo-500/30 p-5 rounded-2xl transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors"></div>

                            <div className="flex justify-between items-start mb-4 relative">
                                <div className={`p-3 rounded-xl border ${getTypeColor(req.type)}`}>
                                    {getTypeIcon(req.type)}
                                </div>
                                <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 capitalize border ${req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        req.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    }`}>
                                    {req.status === 'approved' && <Check size={12} strokeWidth={3} />}
                                    {req.status === 'rejected' && <XCircle size={12} strokeWidth={3} />}
                                    {req.status === 'pending' && <Clock size={12} strokeWidth={3} />}
                                    {req.status === 'pending' ? 'Pendiente' : req.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                                </div>
                            </div>

                            <div className="relative">
                                <h3 className="text-lg font-semibold text-white capitalize mb-1">
                                    {req.type === 'vacation' ? 'Vacaciones' : req.type === 'sick' ? 'Baja Médica' : 'Asunto Personal'}
                                </h3>
                                <p className="text-indigo-300/70 text-sm mb-4 line-clamp-2 min-h-[2.5em]">{req.reason}</p>

                                <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <Calendar size={14} className="text-indigo-400" />
                                    <span>{req.startDate}</span>
                                    <span className="text-gray-600">→</span>
                                    <span>{req.endDate}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    )
}

function FileText({ size, className }: { size?: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
            <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
    )
}
