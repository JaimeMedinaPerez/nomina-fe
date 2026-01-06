import { useAttendanceStore, type AttendanceRecord } from '@/store/attendance-store'
import { useEmployeeStore } from '@/store/employee-store'
import { format, parseISO } from 'date-fns'
import { Search, Edit2, X, Save, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

export function AdminAttendance() {
    const { records, fetchRecords, updateRecord } = useAttendanceStore()
    const { employees, fetchEmployees } = useEmployeeStore() // Need employees for mapping names if needed
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchRecords()
        fetchEmployees()
    }, [])

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 7

    // Edit Modal State
    const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null)
    const [editForm, setEditForm] = useState({
        checkInTime: '',
        checkOutTime: ''
    })

    const handleEditClick = (record: AttendanceRecord) => {
        setEditingRecord(record)
        setEditForm({
            checkInTime: format(parseISO(record.checkIn), 'HH:mm'),
            checkOutTime: record.checkOut ? format(parseISO(record.checkOut), 'HH:mm') : ''
        })
    }

    const handleSaveEdit = () => {
        if (!editingRecord) return

        // Update timestamps preserving the original date
        const baseDate = editingRecord.date

        const newCheckIn = new Date(`${baseDate}T${editForm.checkInTime}:00`)
        let newCheckOut: string | undefined = undefined

        if (editForm.checkOutTime) {
            newCheckOut = new Date(`${baseDate}T${editForm.checkOutTime}:00`).toISOString()
        }

        // Recalculate status based on Employee Schedule
        let newStatus = editingRecord.status
        const employee = employees.find(e => e.id === editingRecord.userId)

        if (employee && employee.workStartTime) {
            const [scheduleHour, scheduleMinute] = employee.workStartTime.split(':').map(Number)
            const [checkInHour, checkInMinute] = editForm.checkInTime.split(':').map(Number)

            const scheduleMinutes = scheduleHour * 60 + scheduleMinute
            const checkInMinutes = checkInHour * 60 + checkInMinute

            // "Tarde" if check-in is > schedule + 10 minutes tolerance
            if (checkInMinutes > scheduleMinutes + 10) {
                newStatus = 'late'
            } else {
                newStatus = 'present'
            }
        } else {
            // Fallback to default 9:00 AM if no specific schedule found
            if (parseInt(editForm.checkInTime.split(':')[0]) >= 9 && parseInt(editForm.checkInTime.split(':')[1]) > 0) {
                newStatus = 'late'
            } else if (parseInt(editForm.checkInTime.split(':')[0]) < 9) {
                newStatus = 'present'
            }
        }

        updateRecord(editingRecord.id, {
            checkIn: newCheckIn.toISOString(),
            checkOut: newCheckOut,
            status: newStatus
        })

        setEditingRecord(null)
    }

    const allFilteredRecords = records
        .filter(r => r.userName.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Pagination Logic
    const totalPages = Math.ceil(allFilteredRecords.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentRecords = allFilteredRecords.slice(startIndex, startIndex + itemsPerPage)

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-500 max-h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-indigo-400">Registro de Asistencia</h1>
                    <p className="text-indigo-300 text-xs">Monitoreo y gestión de horarios.</p>
                </div>
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-2.5 text-indigo-400/50" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar empleado..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setCurrentPage(1) // Reset to page 1 on search
                        }}
                        className="w-full sm:w-64 pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-indigo-400/30 text-xs"
                    />
                </div>
            </div>

            <div className="bg-card border border-border/50 rounded-xl shadow-sm backdrop-blur-sm bg-card/50 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-auto flex-1">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border sticky top-0 bg-card z-10">
                            <tr>
                                <th className="px-4 py-3 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">Empleado</th>
                                <th className="px-4 py-3 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">Fecha</th>
                                <th className="px-4 py-3 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">Entrada</th>
                                <th className="px-4 py-3 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">Salida</th>
                                <th className="px-4 py-3 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">Horas Trabajadas</th>
                                <th className="px-4 py-3 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">Estado</th>
                                <th className="px-4 py-3 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {currentRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-indigo-300/50 text-xs">
                                        No hay registros encontrados.
                                    </td>
                                </tr>
                            ) : (
                                currentRecords.map((record) => {
                                    // Calculate Net Worked Hours
                                    let netDuration = '---';
                                    if (record.checkIn && record.checkOut) {
                                        const start = new Date(record.checkIn).getTime();
                                        const end = new Date(record.checkOut).getTime();
                                        let diff = end - start;

                                        if (record.breakStart && record.breakEnd) {
                                            const breakStart = new Date(record.breakStart).getTime();
                                            const breakEnd = new Date(record.breakEnd).getTime();
                                            diff -= (breakEnd - breakStart);
                                        }

                                        const hours = Math.floor(diff / (1000 * 60 * 60));
                                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                        netDuration = `${hours}h ${minutes}m`;
                                    }

                                    return (
                                        <tr key={record.id} className="hover:bg-muted/30 transition-colors group">
                                            <td className="px-4 py-2.5 font-medium text-indigo-200 text-xs">{record.userName}</td>
                                            <td className="px-4 py-2.5 text-indigo-200/70 text-xs">{record.date}</td>
                                            <td className="px-4 py-2.5 text-indigo-200 text-xs">
                                                {format(parseISO(record.checkIn), 'HH:mm')}
                                            </td>
                                            <td className="px-4 py-2.5 text-indigo-200/70 text-xs">
                                                {record.checkOut ? format(parseISO(record.checkOut), 'HH:mm') : '-'}
                                            </td>
                                            <td className="px-4 py-2.5 text-indigo-200 text-xs font-mono">
                                                {netDuration}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize border ${record.status === 'present'
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                    : record.status === 'late'
                                                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>
                                                    {record.status === 'present' ? 'Puntual' :
                                                        record.status === 'late' ? 'Tarde' : 'Ausente'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                <button
                                                    onClick={() => handleEditClick(record)}
                                                    className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Editar Horas"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="px-4 py-2 border-t border-border flex items-center justify-between shrink-0 bg-card/50">
                        <div className="text-[10px] text-indigo-300">
                            {startIndex + 1} - {Math.min(startIndex + itemsPerPage, allFilteredRecords.length)} de {allFilteredRecords.length}
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-border text-indigo-300 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-6 h-6 rounded-lg text-xs font-medium transition-colors ${currentPage === page
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-indigo-300 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-border text-indigo-300 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingRecord && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-card border border-border rounded-xl shadow-2xl max-w-sm w-full p-6 relative">
                        <button
                            onClick={() => setEditingRecord(null)}
                            className="absolute top-4 right-4 text-indigo-300 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-1">Editar Asistencia</h2>
                        <p className="text-indigo-300 text-sm mb-6">
                            Modifica los registros de {editingRecord.userName} para el {editingRecord.date}.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-indigo-300 mb-1">Hora de Entrada</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-2.5 text-indigo-400/50" size={16} />
                                    <input
                                        type="time"
                                        value={editForm.checkInTime}
                                        onChange={(e) => setEditForm({ ...editForm, checkInTime: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-indigo-300 mb-1">Hora de Salida</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-2.5 text-indigo-400/50" size={16} />
                                    <input
                                        type="time"
                                        value={editForm.checkOutTime}
                                        onChange={(e) => setEditForm({ ...editForm, checkOutTime: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setEditingRecord(null)}
                                className="px-4 py-2 text-indigo-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2"
                            >
                                <Save size={16} /> Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
