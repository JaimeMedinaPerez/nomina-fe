import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format } from 'date-fns'

export interface AttendanceRecord {
    id: string
    userId: string
    userName: string
    date: string // YYYY-MM-DD
    checkIn: string // ISO string
    checkOut?: string // ISO string
    status: 'present' | 'late' | 'absent'
}

// @ts-ignore
import { api } from '../lib/api';

interface AttendanceState {
    records: AttendanceRecord[]
    isLoading: boolean
    clockIn: (employeeId: string) => Promise<any>
    clockOut: (recordId: string) => Promise<any>
    fetchRecords: () => Promise<void>
    fetchAttendance: (userId?: string) => Promise<void>
    updateRecord: (id: string, updates: Partial<AttendanceRecord>) => Promise<void>
    getTodayRecord: (employeeId: string) => AttendanceRecord | undefined
}

export const useAttendanceStore = create<AttendanceState>()(
    persist(
        (set, get) => ({
            records: [],
            isLoading: false,
            fetchRecords: async () => {
                try {
                    set({ isLoading: true });
                    // Correct endpoint: /attendance/records
                    const data = await api.get('/attendance/records');

                    const records = data.map((r: any) => ({
                        id: r.id.toString(),
                        userId: r.usuarioId ? r.usuarioId.toString() : '0', // Map usuarioId
                        userName: r.usuario ? r.usuario.nombre : 'Usuario', // Map usuario.nombre
                        // Handle date intentionally to avoid timezone shifts
                        // r.fecha might be "2025-12-29" or "2025-12-29T00:00:00.000Z"
                        date: typeof r.fecha === 'string' ? r.fecha.substring(0, 10) : r.fecha,
                        checkIn: r.horaEntrada,
                        checkOut: r.horaSalida,
                        status: (r.estado === 'Presente' ? 'present' : r.estado === 'Tarde' ? 'late' : 'absent')
                    }));
                    set({ records, isLoading: false });
                } catch (e) {
                    console.error("Fetch attendance failed", e);
                    set({ isLoading: false });
                }
            },
            fetchAttendance: async (_userId) => {
                // Alias to fetchRecords, ignoring userId as the backend/store handles it or returns all
                await get().fetchRecords();
            },
            clockIn: async (userId) => {
                try {
                    const today = format(new Date(), 'yyyy-MM-dd')
                    const now = new Date().toISOString();

                    const payload = {
                        empleadoId: parseInt(userId),
                        fecha: today,
                        horaEntrada: now,
                        estado: new Date().getHours() > 9 ? 'Tarde' : 'Presente'
                    };

                    const r = await api.post('/attendance/check-in-out', payload);

                    // Optimistic/Direct Update
                    const newRecord: AttendanceRecord = {
                        id: r.id.toString(),
                        userId: r.usuarioId ? r.usuarioId.toString() : userId,
                        userName: r.usuario ? r.usuario.nombre : 'Usuario',
                        date: typeof r.fecha === 'string' ? r.fecha.substring(0, 10) : r.fecha,
                        checkIn: r.horaEntrada,
                        checkOut: r.horaSalida,
                        status: (r.estado === 'Presente' ? 'present' : r.estado === 'Tarde' ? 'late' : 'absent')
                    };

                    set(state => ({
                        records: [...state.records, newRecord]
                    }));

                    return r;
                } catch (e) {
                    console.error(e);
                    throw e;
                }
            },
            clockOut: async (recordId) => {
                try {
                    const now = new Date().toISOString();
                    const r = await api.patch(`/attendance/${recordId}`, { horaSalida: now });

                    // Direct Update in State
                    set(state => ({
                        records: state.records.map(rec =>
                            rec.id === recordId
                                ? { ...rec, checkOut: r.horaSalida }
                                : rec
                        )
                    }));

                    return r;
                } catch (e) {
                    console.error(e);
                    throw e;
                }
            },

            // Legacy/Helper wrappers
            addRecord: (_r: any) => { },
            updateRecord: async (id, updates) => {
                try {
                    const payload: any = {};
                    if (updates.checkIn) payload.horaEntrada = updates.checkIn;
                    if (updates.checkOut) payload.horaSalida = updates.checkOut;
                    if (updates.status) {
                        const statusMap: Record<string, string> = {
                            'present': 'Presente',
                            'late': 'Tarde',
                            'absent': 'Ausente'
                        };
                        payload.estado = statusMap[updates.status] || updates.status;
                    }

                    await api.patch(`/attendance/${id}`, payload);

                    // Direct update
                    set(state => ({
                        records: state.records.map(rec =>
                            rec.id === id
                                ? { ...rec, ...updates } // Simplified update, ideal would be to map 'r' again
                                : rec
                        )
                    }));
                    // get().fetchRecords(); // Removed re-fetch
                } catch (e) {
                    alert('Error al actualizar registro');
                    console.error(e);
                }
            }
            ,
            getTodayRecord: (employeeId) => {
                const today = format(new Date(), 'yyyy-MM-dd')
                const records = get().records;
                const record = records.find(r => {
                    // Robust comparison
                    const isUser = r.userId.toString() === employeeId.toString();
                    const isToday = r.date === today;
                    return isUser && isToday
                })
                console.log(`Checking Today Record for ${employeeId} on ${today}:`, record ? 'Found' : 'Not Found', records.length, 'records loaded');
                return record
            }
        }),
        {
            name: 'attendance-storage',
            partialize: (_state) => ({ records: [] }), // Don't persist records to avoid stale data, rely on fetch
        }
    )
)
