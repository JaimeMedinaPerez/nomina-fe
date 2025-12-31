import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useAttendanceStore } from '@/store/attendance-store'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, LogIn, LogOut, MapPin, Calendar, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function WorkerAttendance() {
    const { user } = useAuthStore()
    const { clockIn, clockOut, fetchRecords, records } = useAttendanceStore()
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        fetchRecords()
        return () => clearInterval(timer)
    }, [])

    const today = format(new Date(), 'yyyy-MM-dd')
    const todayRecord = user && records ? records.find(r => r.userId.toString() === user.id.toString() && r.date === today) : undefined

    const isCheckedIn = !!todayRecord
    const isCheckedOut = !!todayRecord?.checkOut

    const [successModal, setSuccessModal] = useState<{
        isOpen: boolean;
        type: 'check-in' | 'check-out';
        time: string;
        date: string;
        duration?: string;
    } | null>(null);

    const handleAction = async () => {
        if (!user) return
        try {
            if (!isCheckedIn) {
                await clockIn(user.id)
                await fetchRecords() // Sync state
                setSuccessModal({
                    isOpen: true,
                    type: 'check-in',
                    time: format(new Date(), 'HH:mm:ss'),
                    date: format(new Date(), "EEEE, d 'de' MMMM", { locale: es })
                })
            } else if (!isCheckedOut) {
                if (!todayRecord?.id) {
                    console.error('No record ID found!')
                    return
                }
                await clockOut(todayRecord!.id)
                await fetchRecords() // Sync state to ensure UI updates

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
            }
        } catch (e) {
            console.error('Error in handleAction:', e)
            alert('Error al registrar asistencia. Intente nuevamente.')
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Control de Asistencia</h1>
                    <p className="text-indigo-300 mt-1">Gestiona tus entradas y salidas laborales</p>
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
                                <div className="p-3 bg-white/5 rounded-2xl text-green-400">
                                    <Clock size={20} />
                                </div>
                                <span className="text-gray-400">A tiempo</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Card */}
                <div className="relative rounded-3xl bg-card/30 border border-white/5 p-8 flex flex-col items-center justify-center text-center backdrop-blur-sm min-h-[400px]">
                    {!isCheckedOut ? (
                        <div className="relative group">
                            <div className={`absolute inset-0 rounded-full blur-3xl opacity-40 transition-opacity duration-500 ${isCheckedIn ? 'bg-orange-500 group-hover:opacity-60' : 'bg-green-500 group-hover:opacity-60'
                                }`}></div>

                            <button
                                onClick={handleAction}
                                className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center gap-4 transition-all duration-300 transform group-hover:scale-105 shadow-2xl border-4 ${isCheckedIn
                                    ? 'bg-gradient-to-br from-orange-500 to-red-600 border-orange-400/30'
                                    : 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-400/30'
                                    }`}
                            >
                                <div className="text-white drop-shadow-lg">
                                    {isCheckedIn ? <LogOut size={48} /> : <LogIn size={48} />}
                                </div>
                                <span className="text-white font-bold text-lg uppercase tracking-wider">
                                    {isCheckedIn ? 'Salir' : 'Entrar'}
                                </span>
                            </button>
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

                    {!isCheckedOut && (
                        <div className="mt-12 space-y-2">
                            <h3 className="text-xl font-semibold text-white">
                                {isCheckedIn ? 'En Jornada Laboral' : '¿Listo para empezar?'}
                            </h3>
                            <p className="text-indigo-300/80 text-sm max-w-xs mx-auto">
                                {isCheckedIn
                                    ? `Registraste tu entrada a las ${format(new Date(todayRecord!.checkIn), 'HH:mm')}`
                                    : 'Registra tu entrada para comenzar a contabilizar tus horas.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

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

                            <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3 ${successModal.type === 'check-in'
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                                : 'bg-gradient-to-br from-orange-500 to-red-600 text-white'
                                }`}>
                                {successModal.type === 'check-in' ? <LogIn size={32} /> : <LogOut size={32} />}
                            </div>

                            <div className="text-center mb-8 relative z-10">
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {successModal.type === 'check-in' ? '¡Entrada Exitosa!' : '¡Salida Exitosa!'}
                                </h2>
                                <p className="text-indigo-300/80 text-sm">Tu registro se ha guardado correctamente.</p>
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

