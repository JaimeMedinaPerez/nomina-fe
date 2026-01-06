import { useAttendanceStore } from '@/store/attendance-store'
import { usePaymentStore } from '@/store/payment-store'
import { Check, X, DollarSign, Clock, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { format, differenceInMinutes, parseISO } from 'date-fns'
import { api } from '@/lib/api'

export function AdminPayroll() {
    // const { employees, fetchEmployees } = useEmployeeStore() // Removed
    const { records, fetchRecords } = useAttendanceStore()
    const { payments, fetchPayments, approvePayment, getPaymentForPeriod, deletePayment } = usePaymentStore()

    const [users, setUsers] = useState<any[]>([])

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const data = await api.get('/auth/users')
                setUsers(Array.isArray(data) ? data : [])
            } catch (e) {
                console.error("Failed to load users", e)
            }
        }
        loadUsers()
        fetchRecords()
        fetchPayments()
    }, [])

    const [view, setView] = useState<'payroll' | 'history'>('payroll')

    // Approval Modal State
    const [approvalModal, setApprovalModal] = useState<{
        isOpen: boolean;
        employeeId: string | null;
        amount: number;
        employeeName: string;
    }>({ isOpen: false, employeeId: null, amount: 0, employeeName: '' })

    const [voucherRef, setVoucherRef] = useState('')
    const [voucherFile, setVoucherFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    // Current calculation period (e.g., current month)
    const currentPeriod = format(new Date(), 'yyyy-MM')
    const currentMonthLabel = format(new Date(), 'MMMM yyyy')

    // 1. Calculate Payroll Logic (Hourly)
    // Mock salary for now since User table doesn't have it, but we need it for calculation
    // User requested to see "Total a Pagar".
    const DEFAULT_SALARY = 1200;

    // 1. Calculate Payroll Logic (Hourly)
    // iterate over USERS now
    const payrollList = users.map(u => {
        // Match by User ID directly
        const empRecords = records.filter(r =>
            r.userId.toString() === u.id.toString() &&
            r.date.startsWith(currentPeriod) &&
            (r.status === 'present' || r.status === 'late')
        )

        // Debug logic to see why it fails


        // Calculate Total Minutes Worker
        let totalMinutes = 0
        empRecords.forEach(record => {
            if (record.checkIn && record.checkOut) {
                const start = parseISO(record.checkIn)
                const end = parseISO(record.checkOut)
                let minutes = differenceInMinutes(end, start)

                if (record.breakStart && record.breakEnd) {
                    const breakStart = parseISO(record.breakStart)
                    const breakEnd = parseISO(record.breakEnd)
                    const breakDuration = differenceInMinutes(breakEnd, breakStart)
                    minutes -= breakDuration
                }

                totalMinutes += minutes
            }
        })

        const totalHours = Math.round((totalMinutes / 60) * 100) / 100

        // Use default salary or try to find one if we ever map it. 
        // For now, defaulting to 1200 as seen in screenshots.
        const salary = DEFAULT_SALARY;

        // Formula: Hourly Rate = (Salary / 30) / 8
        const hourlyRate = (salary / 30) / 8
        const calculatedPay = Math.round(hourlyRate * totalHours * 100) / 100

        const existingPayment = getPaymentForPeriod(u.id, currentPeriod)

        return {
            id: u.id,
            name: u.nombre, // User has 'nombre'
            email: u.email,
            position: u.rol ? u.rol.nombre : 'Usuario', // User has 'rol', mapped to 'position' for UI
            workedRecords: empRecords.length,
            totalHours,
            hourlyRate,
            grossSalary: salary,
            calculatedPay,
            status: existingPayment ? 'paid' : 'pending',
            paymentId: existingPayment?.id
        }
    })

    const totalToPay = payrollList
        .filter(p => p.status === 'pending')
        .reduce((acc, curr) => acc + curr.calculatedPay, 0)

    const totalPaid = payments.reduce((acc, curr) => acc + curr.amount, 0)

    const formatSoles = (amount: number) => {
        return amount.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })
    }

    const handleOpenApproval = (emp: typeof payrollList[0]) => {
        setApprovalModal({
            isOpen: true,
            employeeId: emp.id,
            employeeName: emp.name,
            amount: emp.calculatedPay
        })
        setVoucherRef('')
        setVoucherFile(null)
    }

    const confirmApproval = async () => {
        if (!approvalModal.employeeId) return

        setIsUploading(true)
        let uploadedUrl = undefined;

        try {
            if (voucherFile) {
                const formData = new FormData()
                formData.append('file', voucherFile)
                // Accessing API_URL via relative path if proxy or hardcoded
                const response = await fetch('http://localhost:3000/files/upload', {
                    method: 'POST',
                    body: formData
                })

                if (response.ok) {
                    const data = await response.json()
                    uploadedUrl = data.url
                } else {
                    console.error('Upload failed', response.statusText)
                }
            }

            await approvePayment({
                employeeId: approvalModal.employeeId,
                employeeName: approvalModal.employeeName,
                amount: approvalModal.amount,
                period: currentPeriod,
                reference: voucherRef,
                voucherUrl: uploadedUrl
            })
            setApprovalModal({ isOpen: false, employeeId: null, amount: 0, employeeName: '' })
        } catch (error) {
            console.error("Payment approval failed", error)
            alert("Error al procesar el pago")
        } finally {
            setIsUploading(false)
        }
    }

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; paymentId: string | null }>({
        isOpen: false,
        paymentId: null
    })

    const handleDeleteClick = (paymentId: string) => {
        setDeleteModal({ isOpen: true, paymentId })
    }

    const confirmDelete = async () => {
        if (deleteModal.paymentId) {
            await deletePayment(deleteModal.paymentId)
            setDeleteModal({ isOpen: false, paymentId: null })
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ... existing header ... */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-indigo-400">Nómina por Horas</h1>
                    <p className="text-indigo-300 text-sm">Cálculo: (Sueldo Neto / 30 / 8) x Horas Trabajadas.</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-200 text-sm font-mono flex items-center">
                        Periodo: <span className="font-bold text-white capitalize kv-2">{currentMonthLabel}</span>
                    </div>
                </div>
            </div>

            <div className="flex border-b border-border mb-4">
                <button
                    onClick={() => setView('payroll')}
                    className={`px-6 py-2 text-sm font-medium border-b-2 transition-colors ${view === 'payroll' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Por Pagar
                </button>
                <button
                    onClick={() => setView('history')}
                    className={`px-6 py-2 text-sm font-medium border-b-2 transition-colors ${view === 'history' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Historial de Pagos
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h3 className="text-gray-400 text-sm font-medium">Pendiente de Pago (Mes Actual)</h3>
                    <p className="text-2xl font-bold text-white mt-2">{formatSoles(totalToPay)}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h3 className="text-gray-400 text-sm font-medium">Total Pagado (Histórico)</h3>
                    <p className="text-2xl font-bold text-green-400 mt-2">{formatSoles(totalPaid)}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h3 className="text-gray-400 text-sm font-medium">Empleados Activos</h3>
                    <p className="text-2xl font-bold text-white mt-2">{users.length}</p>
                </div>
            </div>

            {view === 'payroll' ? (
                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase">Empleado</th>
                                <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase">Salario Base</th>
                                <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase">Costo/Hora</th>
                                <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase">
                                    <div className="flex items-center gap-1">
                                        Total Horas
                                        <Clock size={14} className="text-indigo-400" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase">Total a Pagar</th>
                                <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase">Estado</th>
                                <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {payrollList.map((emp) => (
                                <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">
                                            {emp.name} <span className="text-xs text-gray-500">(ID: {emp.id})</span>
                                        </div>
                                        <div className="text-xs text-gray-500">{emp.position}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300 font-mono text-sm">{formatSoles(emp.grossSalary)}</td>
                                    <td className="px-6 py-4 text-indigo-300 font-mono text-sm">{formatSoles(emp.hourlyRate)}/h</td>
                                    <td className="px-6 py-4 text-white font-bold">{emp.totalHours.toFixed(2)} hrs</td>
                                    <td className="px-6 py-4 font-bold text-indigo-400 text-lg">{formatSoles(emp.calculatedPay)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${emp.status === 'paid'
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                            }`}>
                                            {emp.status === 'paid' ? 'Pagado' : 'Pendiente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {emp.status === 'pending' && emp.calculatedPay > 0 && (
                                            <button
                                                onClick={() => handleOpenApproval(emp)}
                                                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                <Check size={16} /> Pagar
                                            </button>
                                        )}
                                        {emp.status === 'pending' && emp.calculatedPay === 0 && (
                                            <span className="text-xs text-gray-500 italic">Sin horas registradas</span>
                                        )}
                                        {emp.status === 'paid' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-xs text-green-500 flex items-center gap-1">
                                                    <Check size={14} /> Completado
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteClick(emp.paymentId!)}
                                                    className="p-1 hover:bg-red-500/10 rounded text-red-400 transition-colors"
                                                    title="Eliminar registro"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {payrollList.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No hay empleados. Crea uno para comenzar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                    {payments.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No hay pagos registrados en el historial.
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase">Fecha Pago</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase">Periodo</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase">Empleado</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase">Referencia</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase text-right">Monto</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase text-center">Comprobante</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {payments.map((pay) => (
                                    <tr key={pay.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-gray-300">{pay.date}</td>
                                        <td className="px-6 py-4 text-indigo-300/70 font-mono text-sm">{pay.period}</td>
                                        <td className="px-6 py-4 font-medium text-white">{pay.employeeName}</td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">{pay.reference || '-'}</td>
                                        <td className="px-6 py-4 text-right font-bold text-green-400">{formatSoles(pay.amount)}</td>
                                        <td className="px-6 py-4 text-center">
                                            {pay.voucherUrl ? (
                                                <a
                                                    href={`http://localhost:3000${pay.voucherUrl}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs font-medium underline"
                                                >
                                                    Ver
                                                </a>
                                            ) : (
                                                <span className="text-gray-600 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteClick(pay.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-full text-red-400 transition-colors"
                                                title="Eliminar del historial"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Approval Modal */}
            {approvalModal.isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-card border border-border rounded-xl shadow-2xl max-w-sm w-full p-6 relative text-center">
                        <button
                            onClick={() => setApprovalModal({ ...approvalModal, isOpen: false })}
                            className="absolute top-4 right-4 text-indigo-300 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="mx-auto w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                            <DollarSign className="text-indigo-400" size={32} />
                        </div>

                        <h2 className="text-xl font-bold text-white mb-2">Aprobar Pago</h2>
                        <p className="text-indigo-300 text-sm mb-6">
                            Estás a punto de registrar el pago para <strong className="text-white">{approvalModal.employeeName}</strong> por un monto de:
                        </p>

                        <div className="bg-muted/50 rounded-lg p-4 mb-6 border border-border">
                            <span className="text-3xl font-bold text-green-400">{formatSoles(approvalModal.amount)}</span>
                        </div>

                        <div className="text-left mb-6 space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Referencia (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="N° Op. o Nota"
                                    value={voucherRef}
                                    onChange={(e) => setVoucherRef(e.target.value)}
                                    className="w-full px-3 py-2 bg-black/20 border border-border rounded-lg text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Subir Comprobante (Imagen)</label>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setVoucherFile(e.target.files ? e.target.files[0] : null)}
                                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setApprovalModal({ ...approvalModal, isOpen: false })}
                                className="flex-1 py-2 text-indigo-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmApproval}
                                disabled={isUploading}
                                className={`flex-1 py-2 bg-green-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-green-500/20 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
                            >
                                {isUploading ? 'Procesando...' : 'Confirmar Pago'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-card border border-border rounded-xl shadow-2xl max-w-sm w-full p-6 relative text-center">
                        <button
                            onClick={() => setDeleteModal({ isOpen: false, paymentId: null })}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                            <Trash2 className="text-red-400" size={32} />
                        </div>

                        <h2 className="text-xl font-bold text-white mb-2">¿Eliminar Pago?</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            Esta acción es irreversible. El registro de pago será eliminado permanentemente de la base de datos.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, paymentId: null })}
                                className="flex-1 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-500/20"
                            >
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
