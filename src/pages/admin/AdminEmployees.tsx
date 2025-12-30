import { useState, useEffect } from 'react'
import { useEmployeeStore, type Employee } from '@/store/employee-store'
import { Search, Edit2, Trash2, UserPlus, X, AlertTriangle, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

export function AdminEmployees() {
    const { employees, fetchEmployees, addEmployee, updateEmployee, deleteEmployee } = useEmployeeStore()
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchEmployees()
    }, [])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null })

    const initialForm = {
        name: '',
        email: '',
        position: '',
        department: '',
        salary: 0,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active' as const,
        workStartTime: '09:00',
        workEndTime: '18:00'
    }

    const [formData, setFormData] = useState<Omit<Employee, 'id'>>(initialForm)

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 7

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Pagination Logic
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage)

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (editingId) {
            updateEmployee(editingId, formData)
        } else {
            addEmployee(formData)
        }
        handleCloseModal()
    }

    const handleEdit = (employee: Employee) => {
        setFormData(employee)
        setEditingId(employee.id)
        setIsModalOpen(true)
    }

    const confirmDeletion = (id: string) => {
        setConfirmDelete({ isOpen: true, id })
    }

    const executeDelete = () => {
        if (confirmDelete.id) {
            deleteEmployee(confirmDelete.id)
            setConfirmDelete({ isOpen: false, id: null })
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingId(null)
        setFormData(initialForm)
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-500 max-h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-indigo-400">Gestión de Empleados</h1>
                    <p className="text-xs text-indigo-300">Administra el personal, contratos y salarios.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 text-xs font-medium"
                >
                    <UserPlus size={14} />
                    Nuevo Empleado
                </button>
            </div>

            {/* Confirmation Modal */}
            {confirmDelete.isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-card border border-border rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mb-4">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            ¿Eliminar Empleado?
                        </h3>
                        <p className="text-indigo-300 text-sm mb-6">
                            Esta acción eliminará permanentemente al empleado y su historial. No se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDelete({ isOpen: false, id: null })}
                                className="flex-1 py-2 text-indigo-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={executeDelete}
                                className="flex-1 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="relative shrink-0">
                <Search className="absolute left-3 top-2.5 text-indigo-400/50" size={16} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, correo o departamento..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1)
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-card border border-border text-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-indigo-400/30 text-xs"
                />
            </div>

            {/* Table */}
            <div className="bg-card border border-border/50 rounded-xl shadow-sm backdrop-blur-sm bg-card/50 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-auto flex-1">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border sticky top-0 bg-card z-10">
                            <tr>
                                <th className="px-4 py-3 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">Empleado</th>
                                <th className="px-4 py-3 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">Cargo</th>
                                <th className="px-4 py-3 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">Horario</th>
                                <th className="px-4 py-3 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">Salario</th>
                                <th className="px-4 py-3 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">Ingreso</th>
                                <th className="px-4 py-3 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">Estado</th>
                                <th className="px-4 py-3 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {currentEmployees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 text-xs">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-indigo-200 text-xs">{emp.name}</div>
                                                <div className="text-[10px] text-indigo-400/70">{emp.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="text-indigo-200 text-xs">{emp.position}</div>
                                        <div className="text-[10px] text-indigo-400/50">{emp.department}</div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-1.5 text-[10px] text-indigo-300 bg-indigo-500/5 px-2 py-1 rounded-md w-fit">
                                            <Clock size={12} className="text-indigo-400" />
                                            {emp.workStartTime} - {emp.workEndTime}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5 font-mono text-indigo-200 text-xs">
                                        S/ {emp.salary.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2.5 text-indigo-400/70 text-xs">
                                        {emp.joinDate}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize border ${emp.status === 'active'
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {emp.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(emp)}
                                                className="p-1.5 text-indigo-300 hover:text-white hover:bg-indigo-500/20 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => confirmDeletion(emp.id)}
                                                className="p-1.5 text-indigo-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="px-4 py-2 border-t border-border flex items-center justify-between shrink-0 bg-card/50">
                        <div className="text-[10px] text-indigo-300">
                            {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredEmployees.length)} de {filteredEmployees.length}
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

            {/* Employee Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-card border border-border rounded-xl shadow-2xl max-w-2xl w-full p-6 relative">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-indigo-300 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-6">
                            {editingId ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-indigo-300">Nombre Completo</label>
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg text-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-indigo-400/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-indigo-300">Correo Electrónico</label>
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg text-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-indigo-400/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-indigo-300">Cargo / Posición</label>
                                    <input
                                        required
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg text-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-indigo-400/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-indigo-300">Departamento</label>
                                    <select
                                        required
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg text-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Tecnología">Tecnología</option>
                                        <option value="Recursos Humanos">Recursos Humanos</option>
                                        <option value="Ventas">Ventas</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Diseño">Diseño</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-indigo-300">Horario Entrada</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-2.5 text-indigo-400/50" size={16} />
                                        <input
                                            type="time"
                                            value={formData.workStartTime}
                                            onChange={(e) => setFormData({ ...formData, workStartTime: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-indigo-300">Horario Salida</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-2.5 text-indigo-400/50" size={16} />
                                        <input
                                            type="time"
                                            value={formData.workEndTime}
                                            onChange={(e) => setFormData({ ...formData, workEndTime: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-indigo-300">Salario Mensual (S/)</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                                        className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg text-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-indigo-400/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-indigo-300">Fecha de Ingreso</label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.joinDate}
                                        onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                                        className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg text-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-indigo-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                                >
                                    {editingId ? 'Guardar Cambios' : 'Registrar Empleado'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
