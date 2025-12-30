import { create } from 'zustand'
import { persist } from 'zustand/middleware'
// useEmployeeStore import removed

export type UserRole = 'admin' | 'worker'

export interface User {
    id: string
    name: string
    email: string
    role: UserRole
    avatar?: string
    employeeId?: string
}

interface AuthState {
    user: User | null
    token: string | null
    login: (email: string, password: string, role: UserRole) => Promise<boolean>
    logout: () => void
}

// @ts-ignore
import { api } from '../lib/api';

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            login: async (email, password, role) => {
                try {
                    // Call the real login endpoint
                    const user = await api.post('/auth/login', { email, password });

                    if (user) {
                        // Validate Role ID matches the requested portal
                        const userRolId = user.rol ? user.rol.id : user.rolId;

                        if (role === 'admin' && userRolId !== 1) {
                            alert('Acceso Denegado: Este usuario no tiene permisos de Administrador.');
                            return false;
                        }

                        if (role === 'worker' && userRolId !== 2) {
                            alert('Aviso: Debes ingresar desde el portal de Administrador o tu rol no es de trabajador.');
                            return false;
                        }

                        // Map backend user to frontend user
                        const mappedUser: User = {
                            id: user.id.toString(),
                            name: user.nombre,
                            email: user.email,
                            role: userRolId === 1 ? 'admin' : 'worker',
                            avatar: user.avatarUrl || `https://ui-avatars.com/api/?name=${user.nombre}&background=random`,
                            employeeId: user.empleadoId ? user.empleadoId.toString() : undefined
                        };
                        set({ user: mappedUser, token: 'mock-jwt-token' });
                        return true;
                    }
                    return false;
                } catch (e: any) {
                    console.error("Login failed", e);
                    const msg = e.message || 'Error desconocido';
                    alert(`Fallo en el inicio de sesión: ${msg}. Revisa la consola (F12) para más detalles.`);
                    return false;
                }
            },
            logout: () => set({ user: null, token: null }),
        }),
        {
            name: 'auth-storage',
        }
    )
)
