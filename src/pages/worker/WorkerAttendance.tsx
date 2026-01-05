import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useAttendanceStore } from '@/store/attendance-store'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, LogIn, LogOut, MapPin, Calendar, Check, Coffee, PlayCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function WorkerAttendance() {
    const { user } = useAuthStore()
    const { clockIn, clockOut, startBreak, endBreak, fetchRecords, records } = useAttendanceStore()
    const [currentTime, setCurrentTime] = useState(new Date())
    const [breakDuration, setBreakDuration] = useState<string>('')
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [hasShownWarning, setHasShownWarning] = useState(false);

    // Effect 1: Update time and check break duration every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())

            if (user && records) {
                const today = format(new Date(), 'yyyy-MM-dd')
                const todayRecord = records.find(r => r.userId.toString() === user.id.toString() && r.date === today)

                if (todayRecord?.breakStart && !todayRecord.breakEnd) {
                    const start = new Date(todayRecord.breakStart).getTime()
                    const now = new Date().getTime()
                    const diff = now - start
                    const hours = Math.floor(diff / (1000 * 60 * 60))
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
                    setBreakDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)

                    // Warning at 55 minutes
                    if (hours === 0 && minutes >= 55 && !hasShownWarning) {
                        setShowWarningModal(true);
                        setHasShownWarning(true);
                    }
                } else {
                    setBreakDuration('')
                    setHasShownWarning(false);
                }
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [records, user, hasShownWarning])

    // Effect 2: Fetch records only on mount or user change
    useEffect(() => {
        fetchRecords()
    }, [user])

    const today = format(new Date(), 'yyyy-MM-dd')
    const todayRecord = user && records ? records.find(r => r.userId.toString() === user.id.toString() && r.date === today) : undefined

    const isCheckedIn = !!todayRecord
    const isCheckedOut = !!todayRecord?.checkOut
    const isOnBreak = !!todayRecord?.breakStart && !todayRecord?.breakEnd
    const hasTakenBreak = !!todayRecord?.breakStart && !!todayRecord?.breakEnd

    const [successModal, setSuccessModal] = useState<{
        isOpen: boolean;
        type: 'check-in' | 'check-out' | 'start-break' | 'end-break';
        time: string;
        date: string;
        duration?: string;
    } | null>(null);

    const handleAction = async (action: 'check-in' | 'check-out' | 'start-break' | 'end-break') => {
        if (!user) return
        try {
            if (action === 'check-in') {
                await clockIn(user.id)
                await fetchRecords()
                setSuccessModal({
                    isOpen: true,
                    type: 'check-in',
                    time: format(new Date(), 'HH:mm:ss'),
                    date: format(new Date(), "EEEE, d 'de' MMMM", { locale: es })
                })
            } else if (action === 'check-out') {
                if (!todayRecord?.id) return
                await clockOut(todayRecord.id)
                await fetchRecords()

                let durationStr = '';
                if (todayRecord?.checkIn) {
                    const checkInTime = new Date(todayRecord.checkIn).getTime();
                    const checkOutTime = new Date().getTime();
                    const diffMs = checkOutTime - checkInTime;
                    const hours = Math.floor(diffMs / (1000 * 60 * 60));
                    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    durationStr = `${hours}h ${minutes}m`;
                }

                setSuccessModal({
                    isOpen: true,
                    type: 'check-out',
                    time: format(new Date(), 'HH:mm:ss'),
                    date: format(new Date(), "EEEE, d 'de' MMMM", { locale: es }),
                    duration: durationStr
                })
            } else if (action === 'start-break') {
                if (!todayRecord?.id) return
                await startBreak(todayRecord.id)
                await fetchRecords()
                setSuccessModal({
                    isOpen: true,
                    type: 'start-break',
                    time: format(new Date(), 'HH:mm:ss'),
                    date: format(new Date(), "EEEE, d 'de' MMMM", { locale: es })
                })
            } else if (action === 'end-break') {
                if (!todayRecord?.id) return
                await endBreak(todayRecord.id)
                await fetchRecords()
                setSuccessModal({
                    isOpen: true,
                    type: 'end-break',
                    time: format(new Date(), 'HH:mm:ss'),
                    date: format(new Date(), "EEEE, d 'de' MMMM", { locale: es })
                })
            }
        } catch (e: any) {
            console.error('Error in handleAction:', e)
            const msg = e.response?.data?.message || e.message || 'Error desconocido';
            alert(`Error al registrar acción: ${msg}`)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Control de Asistencia</h1>
                    <p className="text-indigo-300 mt-1">Gestiona tus entradas, salidas y tiempos de descanso</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-sm">
                    <MapPin size={16} />
                    <span>Oficina Principal (Simulado)</span>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Clock Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1c4b] to-[#0f102a] border border-white/5 p-8 shadow-2xl flex flex-col justify-center items-center text-center min-h-[400px]">
                    <div className="absolute top-0 right-0 p-40 bg-indigo-500/20 rounded-full blur-[100px] -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 p-32 bg-purple-500/10 rounded-full blur-[80px] -ml-16 -mb-16"></div>

                    <div className="relative z-10">
                        <p className="text-indigo-300 font-medium text-lg uppercase tracking-widest mb-4">
                            {format(currentTime, "EEEE, d 'de' MMMM", { locale: es })}
                        </p>
                        <div className="text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-tighter tabular-nums mb-8 leading-none">
                            {format(currentTime, 'HH:mm:ss')}
                        </div>

                        <div className="flex items-center justify-center gap-8 text-sm">
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="p-3 bg-white/5 rounded-2xl text-indigo-400">
                                    <Calendar size={20} />
                                </div>
                                <span className="text-gray-400">Semana 52</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                                <div className={`p-3 rounded-2xl ${isOnBreak ? 'bg-orange-500/10 text-orange-400' : 'bg-white/5 text-green-400'}`}>
                                    {isOnBreak ? <Coffee size={20} /> : <Clock size={20} />}
                                </div>
                                <span className="text-gray-400">{isOnBreak ? 'En Break' : 'A tiempo'}</span>
                            </div>
                        </div>

                        {isOnBreak && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-8 px-6 py-2 rounded-full inline-flex items-center gap-3 border ${parseInt(breakDuration.split(':')[0]) >= 1
                                    ? 'bg-red-500/10 border-red-500/20'
                                    : 'bg-orange-500/10 border-orange-500/20'
                                    }`}
                            >
                                <div className={`w-2 h-2 rounded-full animate-pulse ${parseInt(breakDuration.split(':')[0]) >= 1 ? 'bg-red-500' : 'bg-orange-500'
                                    }`}></div>
                                <span className={`font-mono text-xl ${parseInt(breakDuration.split(':')[0]) >= 1 ? 'text-red-300' : 'text-orange-300'
                                    }`}>{breakDuration}</span>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Action Card */}
                <div className="relative rounded-3xl bg-card/30 border border-white/5 p-8 flex flex-col items-center justify-center text-center backdrop-blur-sm min-h-[400px]">
                    {!isCheckedOut ? (
                        <div className="flex flex-col gap-6 items-center">
                            {/* Main Button */}
                            <div className="relative group">
                                <div className={`absolute inset-0 rounded-full blur-3xl opacity-40 transition-opacity duration-500 ${isOnBreak
                                    ? 'bg-blue-500 group-hover:opacity-60' // Returning from break
                                    : isCheckedIn
                                        ? 'bg-red-500 group-hover:opacity-60' // Signing out
                                        : 'bg-green-500 group-hover:opacity-60' // Signing in
                                    }`}></div>

                                <button
                                    onClick={() => {
                                        if (isOnBreak) {
                                            handleAction('end-break')
                                        } else if (isCheckedIn) {
                                            handleAction('check-out')
                                        } else {
                                            handleAction('check-in')
                                        }
                                    }}
                                    className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center gap-4 transition-all duration-300 transform group-hover:scale-105 shadow-2xl border-4 ${isOnBreak
                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400/30'
                                        : isCheckedIn
                                            ? 'bg-gradient-to-br from-red-500 to-rose-600 border-red-400/30'
                                            : 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-400/30'
                                        }`}
                                >
                                    <div className="text-white drop-shadow-lg">
                                        {isOnBreak ? <PlayCircle size={48} /> : isCheckedIn ? <LogOut size={48} /> : <LogIn size={48} />}
                                    </div>
                                    <span className="text-white font-bold text-lg uppercase tracking-wider">
                                        {isOnBreak ? 'Finalizar Break' : isCheckedIn ? 'Salir' : 'Entrar'}
                                    </span>
                                </button>
                            </div>

                            {/* Secondary Break Button */}
                            {isCheckedIn && !isOnBreak && !hasTakenBreak && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => handleAction('start-break')}
                                    className="flex items-center gap-2 px-6 py-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl text-orange-300 transition-colors"
                                >
                                    <Coffee size={20} />
                                    <span className="font-semibold">Tomar Break (1h)</span>
                                </motion.button>
                            )}

                            {hasTakenBreak && isCheckedIn && (
                                <div className="text-green-400 text-sm bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20 flex items-center gap-2">
                                    <Check size={14} />
                                    Break completado
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="w-32 h-32 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 mb-6 border-4 border-slate-700/30">
                                <Check size={48} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Jornada Finalizada</h3>
                            <p className="text-indigo-300 max-w-xs mx-auto"> Has completado tu registro de hoy. ¡Que tengas un buen descanso!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Warning Modal */}
            <AnimatePresence>
                {showWarningModal && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-8 right-8 z-50 bg-amber-500/10 backdrop-blur-md border border-amber-500/20 p-6 rounded-2xl shadow-2xl max-w-sm"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-500">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Tiempo Restante</h3>
                                <p className="text-amber-200/80 text-sm">Tu break de 1 hora está por terminar. Te quedan pocos minutos.</p>
                                <button
                                    onClick={() => setShowWarningModal(false)}
                                    className="mt-4 text-xs font-bold text-amber-500 hover:text-amber-400 uppercase tracking-wider"
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Modal */}
            <AnimatePresence>
                {successModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#0f102a] border border-indigo-500/20 rounded-3xl shadow-2xl max-w-sm w-full p-8 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>

                            <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3 ${successModal.type === 'check-in' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                                successModal.type === 'check-out' ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                                    'bg-gradient-to-br from-orange-500 to-amber-600'
                                } text-white`}>
                                {successModal.type === 'check-in' && <LogIn size={32} />}
                                {successModal.type === 'check-out' && <LogOut size={32} />}
                                {(successModal.type === 'start-break' || successModal.type === 'end-break') && <Coffee size={32} />}
                            </div>

                            <div className="text-center mb-8 relative z-10">
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {successModal.type === 'check-in' && '¡Entrada Exitosa!'}
                                    {successModal.type === 'check-out' && '¡Salida Exitosa!'}
                                    {successModal.type === 'start-break' && '¡Break Iniciado!'}
                                    {successModal.type === 'end-break' && '¡Break Finalizado!'}
                                </h2>
                                <p className="text-indigo-300/80 text-sm">Registro guardado correctamente.</p>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-4 mb-8 space-y-3 border border-white/5 relative z-10">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Hora</span>
                                    <span className="text-white font-mono font-bold">{successModal.time}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Fecha</span>
                                    <span className="text-indigo-300 capitalize">{successModal.date}</span>
                                </div>
                                {successModal.duration && (
                                    <div className="flex justify-between items-center text-sm pt-3 border-t border-white/5 mt-1">
                                        <span className="text-gray-400">Duración</span>
                                        <span className="text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded text-xs">{successModal.duration}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setSuccessModal(null)}
                                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25 relative z-10"
                            >
                                Continuar
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
