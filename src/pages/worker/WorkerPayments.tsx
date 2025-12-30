import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { DollarSign, Download, Calendar, TrendingUp, CreditCard } from 'lucide-react'
import { api } from '@/lib/api'
import { motion } from 'framer-motion'

interface Payment {
    id: string
    fechaPago: string
    periodo: string // 2023-10
    totalIngresos: number
    netoAPagar: number
    referencia?: string
    urlComprobante?: string
    estado: string // Pendiente, Pagado
}

export function WorkerPayments() {
    const { user } = useAuthStore()
    const [payments, setPayments] = useState<Payment[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!user) return
        const fetchPayments = async () => {
            setIsLoading(true)
            try {
                const data = await api.get(`/payments/user/${user.id}`)
                setPayments(Array.isArray(data) ? data : [])
            } catch (e) {
                console.error("Failed to load payments", e)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPayments()
    }, [user])

    const formatSoles = (amount: number) => {
        return Number(amount).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })
    }

    const totalPaid = payments.reduce((acc, curr) => acc + Number(curr.netoAPagar), 0)

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

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Mis Pagos</h1>
                    <p className="text-indigo-300 mt-1">Historial de nóminas y comprobantes de pago</p>
                </div>
            </div>

            {/* Total Summary Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 p-8 shadow-xl">
                <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative flex items-center gap-6">
                    <div className="p-4 bg-emerald-500/20 rounded-2xl text-emerald-400">
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <p className="text-emerald-200/80 font-medium mb-1">Total Percibido</p>
                        <h2 className="text-4xl font-bold text-white tracking-tight">{formatSoles(totalPaid)}</h2>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-card/30 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : payments.length === 0 ? (
                <div className="text-center py-20 bg-card/30 rounded-3xl border border-white/5">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                        <DollarSign size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No hay pagos registrados</h3>
                    <p className="text-indigo-300/60 max-w-sm mx-auto">Aún no se han generado boletas de pago para tu cuenta.</p>
                </div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                    {payments.map((pay) => (
                        <motion.div
                            key={pay.id}
                            variants={item}
                            className="group bg-card/50 hover:bg-card/80 border border-white/5 hover:border-indigo-500/30 rounded-2xl p-6 transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-indigo-500/10 transition-colors"></div>

                            <div className="flex justify-between items-start mb-6 relative">
                                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                                    <CreditCard size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${pay.estado === 'Pagado'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    }`}>
                                    {pay.estado}
                                </span>
                            </div>

                            <div className="space-y-4 relative">
                                <div>
                                    <p className="text-indigo-300/60 text-xs font-medium uppercase tracking-widest mb-1">Monto Neto</p>
                                    <h3 className="text-2xl font-bold text-white">{formatSoles(pay.netoAPagar)}</h3>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-white/5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-indigo-300/70 flex items-center gap-2">
                                            <Calendar size={14} /> Fecha
                                        </span>
                                        <span className="text-white font-medium">{pay.fechaPago}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-indigo-300/70">Periodo</span>
                                        <span className="text-white font-mono">{pay.periodo}</span>
                                    </div>
                                </div>

                                {pay.urlComprobante ? (
                                    <a
                                        href={`http://localhost:3000${pay.urlComprobante}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl transition-all font-medium text-sm group-hover:shadow-lg group-hover:shadow-indigo-500/20"
                                    >
                                        <Download size={16} />
                                        Descargar Boleta
                                    </a>
                                ) : (
                                    <button disabled className="mt-4 w-full py-2.5 bg-white/5 text-gray-500 rounded-xl text-sm font-medium cursor-not-allowed">
                                        No disponible
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    )
}
