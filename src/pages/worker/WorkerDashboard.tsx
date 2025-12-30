import { useAuthStore } from '@/store/auth-store'
import { useAttendanceStore } from '@/store/attendance-store'
import { usePaymentStore } from '@/store/payment-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { useDocumentStore } from '@/store/documents-store'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, DollarSign, Calendar, CheckCircle, FileText, ArrowRight, TrendingUp, AlertCircle, CalendarRange } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { motion } from 'framer-motion'

export function WorkerDashboard() {
    const { user } = useAuthStore()
    const { records, getTodayRecord, fetchAttendance } = useAttendanceStore()
    const { payments, fetchPayments } = usePaymentStore()
    const { getUserRequests } = usePermissionsStore()
    const { documents, fetchDocuments } = useDocumentStore()

    if (!user) return null

    useEffect(() => {
        if (user?.id) {
            fetchAttendance(user.id)
            fetchDocuments(user.id)
            fetchPayments()
        }
    }, [user, fetchAttendance, fetchDocuments, fetchPayments])

    // --- Logic Wrappers ---

    // 1. Attendance Today
    const todayRecord = getTodayRecord(user.id)
    const isClockedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut

    // 2. Attendance Stats (Current Month)
    const currentMonthPrefix = format(new Date(), 'yyyy-MM')
    const thisMonthRecords = records.filter(r =>
        r.userId === user.id &&
        r.date.startsWith(currentMonthPrefix)
    )
    const daysWorked = thisMonthRecords.length

    // 3. Pending Permissions
    const myRequests = getUserRequests(user.id)
    const pendingPermissions = myRequests.filter(r => r.status === 'pending').length

    // 4. Last Payment
    const lastPayment = payments
        .filter(p => p.employeeId === user.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    const formatSoles = (amount: number) => {
        return amount.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })
    }

    // 5. Recent Documents
    const recentDocs = documents
        .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
        .slice(0, 4) // Show 4 max

    // --- Animations ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    }

    return (
        <motion.div
            className="space-y-4 p-1 max-h-screen overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900/40 border border-indigo-500/20 p-5 shadow-lg backdrop-blur-sm shrink-0">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl"></div>

                <div className="relative z-10 flex flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Hola, {user.name.split(' ')[0]}
                        </h1>
                        <p className="text-indigo-200 text-sm font-light">
                            Bienvenido a tu panel de control.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md">
                        <CalendarRange className="text-indigo-400" size={16} />
                        <span className="text-indigo-100 font-medium tracking-wide text-xs">
                            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">

                {/* Card 1: Attendance Status */}
                <Link to="/worker/attendance">
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -2 }}
                        className="h-full bg-card/50 backdrop-blur-md border border-border/50 rounded-xl p-4 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all"
                    >
                        <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Clock size={40} />
                        </div>

                        <div className="flex flex-col h-full justify-between relative z-10 gap-2">
                            <div className="flex justify-between items-start">
                                <div className={`p-2 rounded-lg ${isClockedIn ? 'bg-green-500/20 text-green-400' : 'bg-slate-700/50 text-slate-400'} transition-colors`}>
                                    <Clock size={16} />
                                </div>
                                {isClockedIn && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>}
                            </div>

                            <div>
                                <h3 className="text-slate-400 text-xs font-medium mb-0.5">Estado Actual</h3>
                                <p className={`text-lg font-bold ${isClockedIn ? 'text-green-400' : 'text-white'}`}>
                                    {isClockedIn ? 'En Turno' : 'Salida'}
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium">
                                    {todayRecord ? `Entrada: ${format(parseISO(todayRecord.checkIn), 'HH:mm')}` : 'Sin registro hoy'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </Link>

                {/* Card 2: Days Worked */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                    className="bg-card/50 backdrop-blur-md border border-border/50 rounded-xl p-4 relative overflow-hidden group shadow-sm"
                >
                    <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Calendar size={40} />
                    </div>

                    <div className="flex flex-col h-full justify-between relative z-10 gap-2">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                <TrendingUp size={16} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-slate-400 text-xs font-medium mb-0.5">Días Trabajados</h3>
                            <p className="text-lg font-bold text-white">{daysWorked}</p>
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 rounded">
                                    {format(new Date(), 'MMMM', { locale: es })}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Card 3: Payments */}
                <Link to="/worker/payments">
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -2 }}
                        className="h-full bg-card/50 backdrop-blur-md border border-border/50 rounded-xl p-4 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-emerald-500/10 hover:border-emerald-500/30 transition-all"
                    >
                        <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                            <DollarSign size={40} />
                        </div>

                        <div className="flex flex-col h-full justify-between relative z-10 gap-2">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                                    <DollarSign size={16} />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-slate-400 text-xs font-medium mb-0.5">Último Pago</h3>
                                <p className="text-lg font-bold text-white">
                                    {lastPayment ? formatSoles(lastPayment.amount) : 'S/ 0.00'}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                    {lastPayment ? `Periodo: ${lastPayment.period}` : 'No hay pagos'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </Link>

                {/* Card 4: Permissions */}
                <Link to="/worker/permissions">
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -2 }}
                        className="h-full bg-card/50 backdrop-blur-md border border-border/50 rounded-xl p-4 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-amber-500/10 hover:border-amber-500/30 transition-all"
                    >
                        <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                            <CheckCircle size={40} />
                        </div>

                        <div className="flex flex-col h-full justify-between relative z-10 gap-2">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                                    <AlertCircle size={16} />
                                </div>
                                {pendingPermissions > 0 &&
                                    <span className="bg-amber-500 text-black text-[9px] font-bold px-1.5 rounded-full">
                                        {pendingPermissions}
                                    </span>
                                }
                            </div>

                            <div>
                                <h3 className="text-slate-400 text-xs font-medium mb-0.5">Solicitudes</h3>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-lg font-bold text-white">{pendingPermissions}</p>
                                    <span className="text-[10px] text-slate-500">pendientes</span>
                                </div>
                                <p className="text-[10px] text-slate-500">
                                    Vacaciones y permisos
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </Link>
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-280px)] min-h-[300px]">

                {/* Left Column: Documents (2/3 width) */}
                <motion.div variants={itemVariants} className="lg:col-span-2 h-full">
                    <div className="bg-card/30 border border-border/50 rounded-xl p-4 backdrop-blur-sm h-full flex flex-col">
                        <div className="flex items-center justify-between mb-3 shrink-0">
                            <h2 className="text-base font-semibold text-white flex items-center gap-2">
                                <FileText className="text-indigo-400" size={16} />
                                Documentos Recientes
                            </h2>
                            <Link to="/worker/documents" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 group">
                                Ver todos
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                            {recentDocs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-slate-700/50 rounded-xl bg-slate-800/20">
                                    <FileText className="text-slate-600 mb-2" size={32} />
                                    <p className="text-slate-400 text-xs">No hay documentos recientes</p>
                                </div>
                            ) : (
                                recentDocs.slice(0, 3).map((doc, index) => (
                                    <motion.div
                                        key={doc.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg hover:bg-slate-700/30 transition-colors group"
                                    >
                                        <div className={`p-2 rounded-lg ${doc.type === 'contract'
                                            ? 'bg-blue-500/10 text-blue-400'
                                            : 'bg-indigo-500/10 text-indigo-400'
                                            }`}>
                                            <FileText size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors truncate">
                                                {doc.title}
                                            </h4>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                <span className="bg-slate-700/50 px-1.5 rounded capitalize">{doc.type}</span>
                                                <span>•</span>
                                                <span>{format(new Date(doc.uploadDate), 'dd MMM', { locale: es })}</span>
                                                <span>•</span>
                                                <span>{doc.size}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Activity & Actions (1/3 width) */}
                <motion.div variants={itemVariants} className="h-full flex flex-col gap-4">

                    {/* Activity Timeline */}
                    <div className="bg-card/30 border border-border/50 rounded-xl p-4 backdrop-blur-sm flex-1 flex flex-col min-h-0">
                        <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2 shrink-0">
                            <Clock className="text-purple-400" size={16} />
                            Actividad Reciente
                        </h2>

                        <div className="relative pl-1.5 space-y-4 overflow-y-auto pr-1 flex-1">
                            {/* Vertical Line */}
                            <div className="absolute top-2 bottom-2 left-[14px] w-[2px] bg-slate-800/60 rounded-full"></div>

                            {thisMonthRecords.length === 0 ? (
                                <p className="text-slate-500 text-xs italic pl-4">No hay registros.</p>
                            ) : (
                                thisMonthRecords.slice(0, 3).map((record) => (
                                    <div key={record.id} className="relative flex gap-3 items-start group">
                                        {/* Dot */}
                                        <div className={`z-10 w-2.5 h-2.5 rounded-full mt-1.5 ring-offset-2 ring-offset-[#0f102a] ring-2 ${record.checkOut ? 'bg-indigo-500 ring-indigo-500/20' : 'bg-green-500 ring-green-500/20'
                                            }`} />

                                        <div className="flex-1 bg-slate-800/20 p-2.5 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                                            <p className="text-xs font-medium text-slate-200">
                                                {record.checkOut ? 'Jornada Completada' : 'Jornada en Curso'}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5 mb-1.5">
                                                {format(parseISO(record.date), "EEE, d MMM", { locale: es })}
                                            </p>
                                            <div className="flex items-center justify-between text-[10px] bg-slate-900/30 rounded px-2 py-1">
                                                <span className="text-indigo-300 font-mono">
                                                    {format(parseISO(record.checkIn), 'HH:mm')}
                                                </span>
                                                <ArrowRight size={8} className="text-slate-600" />
                                                <span className="text-indigo-300 font-mono">
                                                    {record.checkOut ? format(parseISO(record.checkOut), 'HH:mm') : '--:--'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Action - Condensed */}
                    <Link
                        to="/worker/permissions"
                        className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-3 text-white shadow-lg flex items-center justify-between group hover:shadow-indigo-500/20 transition-all shrink-0"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold">Solicitar Permiso</h3>
                                <p className="text-[10px] text-indigo-100 opacity-80">Vacaciones o asuntos personales</p>
                            </div>
                        </div>
                        <ArrowRight size={16} className="text-white/70 group-hover:translate-x-1 transition-transform" />
                    </Link>

                </motion.div>
            </div>
        </motion.div>
    )
}
