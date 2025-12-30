import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PermissionType = 'vacation' | 'sick' | 'personal'
export type PermissionStatus = 'pending' | 'approved' | 'rejected'

export interface PermissionRequest {
    id: string
    userId: string
    userName: string
    type: PermissionType
    startDate: string
    endDate: string
    reason: string
    status: PermissionStatus
    createdAt: string
}

// @ts-ignore
import { api } from '../lib/api';

interface PermissionsState {
    requests: PermissionRequest[]
    isLoading: boolean
    fetchRequests: () => Promise<void>
    addRequest: (request: any) => Promise<void>
    updateStatus: (id: string, status: PermissionStatus) => Promise<void>
    getUserRequests: (userId: string) => PermissionRequest[]
}

export const usePermissionsStore = create<PermissionsState>()(
    persist(
        (set, get) => ({
            requests: [],
            isLoading: false,
            fetchRequests: async () => {
                try {
                    set({ isLoading: true });
                    const data = await api.get('/permissions');
                    const requests = data.map((p: any) => ({
                        id: p.id.toString(),
                        userId: p.empleadoId.toString(),
                        userName: p.empleado ? p.empleado.nombre : 'Empleado',
                        type: p.tipo.toLowerCase(),
                        startDate: p.fechaInicio,
                        endDate: p.fechaFin,
                        reason: p.motivo,
                        status: (() => {
                            const s = p.estado.toLowerCase();
                            if (s.includes('aprobado')) return 'approved';
                            if (s.includes('rechazado')) return 'rejected';
                            return 'pending'; // Pendiente maps to pending
                        })(),
                        createdAt: p.fechaCreacion
                    }));
                    set({ requests, isLoading: false });
                } catch (e) {
                    console.error("Fetch permissions failed", e);
                    set({ isLoading: false });
                }
            },
            addRequest: async (req) => {
                try {
                    const payload = {
                        empleadoId: parseInt(req.userId),
                        tipo: req.type,
                        fechaInicio: req.startDate,
                        fechaFin: req.endDate,
                        motivo: req.reason,
                        estado: 'Pendiente'
                    };
                    await api.post('/permissions', payload);
                    get().fetchRequests();
                } catch (e) {
                    alert('Error al crear permiso');
                    console.error(e);
                }
            },
            updateStatus: async (id, status) => {
                try {
                    // Map status to Title Case if backend expects it (e.g. 'Aprobado')
                    const estadoMap: Record<string, string> = {
                        'approved': 'Aprobado',
                        'rejected': 'Rechazado',
                        'pending': 'Pendiente'
                    };
                    const estado = estadoMap[status] || status;

                    await api.patch(`/permissions/${id}/status`, { estado });
                    get().fetchRequests();
                } catch (e) {
                    alert('Error al actualizar estado');
                    console.error(e);
                }
            },
            getUserRequests: (userId) => get().requests.filter(r => r.userId === userId)
        }),
        {
            name: 'permissions-storage',
            partialize: (_state) => ({ requests: [] as PermissionRequest[] }), // Don't persist
        }
    )
)
