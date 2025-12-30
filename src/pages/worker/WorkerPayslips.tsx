import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { Download, DollarSign, Calendar, FileText, ExternalLink } from 'lucide-react'
import { api } from '@/lib/api'

interface Payment {
    id: string
    fechaPago: string
    periodo: string
    netoAPagar: number
    referencia?: string
    urlComprobante?: string
    estado: string // Pagado
}

export function WorkerPayslips() {
    const { user } = useAuthStore()
    const [payments, setPayments] = useState<Payment[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!user) return
        const fetchUserPayments = async () => {
            setIsLoading(true)
            try {
                const data = await api.get(`/payments/user/${user.id}`)
                setPayments(Array.isArray(data) ? data : [])
            } catch (e) {
                console.error("Failed to fetch payments", e)
            } finally {
                setIsLoading(false)
            }
        }
        fetchUserPayments()
    }, [user])

    const formatSoles = (amount: number) => {
        return Number(amount).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-indigo-400">Mis Pagos</h1>
                    <p className="text-indigo-300 text-sm">Historial de nóminas y comprobantes.</p>
                </div>
                {payments.length > 0 && (
                    <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                        <span className="text-xs text-indigo-300 block">Total Recibido</span>
                        <span className="text-xl font-bold text-green-400">
                            {formatSoles(payments.reduce((acc, curr) => acc + Number(curr.netoAPagar), 0))}
                        </span>
                    </div>
                )}
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-500">Cargando pagos...</div>
                ) : payments.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                            <DollarSign className="text-indigo-300/30" size={32} />
                        </div>
                        <h3 className="text-indigo-200 font-medium mb-1">No hay pagos registrados</h3>
                        <p className="text-indigo-400/50 text-sm max-w-xs mx-auto">
                            Tus pagos aparecerán aquí una vez que sean procesados.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {payments.map((payment) => (
                            <div key={payment.id} className="p-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium flex items-center gap-2">
                                            Pago Realizado
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                                {payment.estado}
                                            </span>
                                        </h3>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-indigo-300/70">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} /> Fecha: {payment.fechaPago}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <DollarSign size={14} /> Periodo: {payment.periodo}
                                            </span>
                                        </div>
                                        {payment.referencia && (
                                            <p className="text-xs text-indigo-400/50 mt-1">
                                                Ref: {payment.referencia}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                                    <div className="text-right flex-1 sm:flex-none">
                                        <div className="text-xl font-bold text-white">{formatSoles(payment.netoAPagar)}</div>
                                        <div className="text-xs text-indigo-400">Neto recibido</div>
                                    </div>
                                    {payment.urlComprobante ? (
                                        <a
                                            href={`http://localhost:3000${payment.urlComprobante}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 text-indigo-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                                            title="Ver Comprobante"
                                        >
                                            <span className="text-xs font-medium">Ver</span>
                                            <ExternalLink size={20} />
                                        </a>
                                    ) : (
                                        <div className="p-2 text-gray-600 cursor-not-allowed" title="Sin Comprobante">
                                            <Download size={20} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
