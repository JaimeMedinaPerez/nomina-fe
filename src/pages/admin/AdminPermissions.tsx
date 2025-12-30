import { usePermissionsStore, type PermissionType } from '@/store/permissions-store'
import { Check, X, FileText, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'

export function AdminPermissions() {
    const { requests, fetchRequests, updateStatus } = usePermissionsStore()
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

    useEffect(() => {
        fetchRequests()
    }, [])

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        requestId: string | null;
        action: 'approve' | 'reject' | null;
    }>({ isOpen: false, requestId: null, action: null })

    const filteredRequests = requests.filter(r => {
        if (filter === 'all') return true
        return r.status === filter
    })

    const typeLabels: Record<PermissionType | 'sick_leave', string> = {
        vacation: 'Vacaciones',
        sick: 'Licencia Médica',
        sick_leave: 'Licencia Médica',
        personal: 'Asunto Personal'
    }

    const openConfirm = (id: string, action: 'approve' | 'reject') => {
        setConfirmModal({ isOpen: true, requestId: id, action })
    }

    const handleConfirm = () => {
        if (confirmModal.requestId && confirmModal.action) {
            updateStatus(
                confirmModal.requestId,
                confirmModal.action === 'approve' ? 'approved' : 'rejected'
            )
        }
        setConfirmModal({ isOpen: false, requestId: null, action: null })
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-indigo-400">Solicitudes de Permiso</h1>
                    <p className="text-indigo-300 text-sm">Gestiona las ausencias y vacaciones del personal.</p>
                </div>

                <div className="flex gap-2 p-1 bg-card border border-border rounded-lg overflow-x-auto">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${filter === f
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-indigo-300 hover:text-white'
                                }`}
                        >
                            {f === 'all' ? 'Todas' :
                                f === 'pending' ? 'Pendientes' :
                                    f === 'approved' ? 'Aprobadas' : 'Rechazadas'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-card border border-border rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
                        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${confirmModal.action === 'approve' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                            {confirmModal.action === 'approve' ? <Check size={24} /> : <AlertTriangle size={24} />}
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            {confirmModal.action === 'approve' ? '¿Aprobar Solicitud?' : '¿Rechazar Solicitud?'}
                        </h3>
                        <p className="text-indigo-300 text-sm mb-6">
                            {confirmModal.action === 'approve'
                                ? 'El empleado será notificado y el permiso se registrará oficialmente.'
                                : 'Esta acción no se puede deshacer. ¿Estás seguro?'}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal({ isOpen: false, requestId: null, action: null })}
                                className="flex-1 py-2 text-indigo-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 py-2 rounded-lg font-medium text-white transition-colors ${confirmModal.action === 'approve'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRequests.map((req) => (
                    <div key={req.id} className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4 group hover:border-indigo-500/30 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{req.userName}</h3>
                                    <p className="text-xs text-indigo-300">{typeLabels[req.type as PermissionType] || req.type}</p>
                                </div>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${req.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                req.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                }`}>
                                {req.status === 'pending' ? 'Pendiente' :
                                    req.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Desde:</span>
                                <span className="text-gray-300">{req.startDate}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Hasta:</span>
                                <span className="text-gray-300">{req.endDate}</span>
                            </div>
                            <div className="pt-2">
                                <p className="text-sm text-gray-400 italic">"{req.reason}"</p>
                            </div>
                        </div>

                        {req.status === 'pending' && (
                            <div className="pt-4 mt-auto flex gap-2">
                                <button
                                    onClick={() => openConfirm(req.id, 'reject')}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors font-medium text-sm"
                                >
                                    <X size={16} /> Rechazar
                                </button>
                                <button
                                    onClick={() => openConfirm(req.id, 'approve')}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium text-sm"
                                >
                                    <Check size={16} /> Aprobar
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {filteredRequests.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        No hay solicitudes {filter === 'all' ? 'registradas' :
                            filter === 'pending' ? 'pendientes' :
                                filter === 'approved' ? 'aprobadas' : 'rechazadas'}.
                    </div>
                )}
            </div>
        </div>
    )
}
