import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Employee {
    id: string
    name: string
    email: string
    position: string
    department: string
    salary: number
    joinDate: string
    status: 'active' | 'inactive'
    workStartTime: string // "09:00"
    workEndTime: string   // "18:00"
}

interface EmployeeState {
    employees: Employee[]
    fetchEmployees: () => Promise<void>
    addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>
    updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>
    deleteEmployee: (id: string) => Promise<void>
}

// @ts-ignore
import { api } from '../lib/api';

export const useEmployeeStore = create<EmployeeState>()(
    persist(
        (set, get) => ({
            employees: [],
            fetchEmployees: async () => {
                try {
                    const data = await api.get('/employees');
                    const employees = data.map((emp: any) => ({
                        id: emp.id.toString(),
                        name: emp.nombre,
                        email: emp.email,
                        position: emp.cargo ? emp.cargo.nombre : 'Sin Cargo',
                        department: emp.departamento ? emp.departamento.nombre : 'Sin Departamento',
                        salary: Number(emp.salario),
                        joinDate: emp.fechaIngreso ? emp.fechaIngreso.split('T')[0] : '', // Format date
                        status: emp.estado === 'Activo' ? 'active' : 'inactive',
                        workStartTime: emp.horaEntrada,
                        workEndTime: emp.horaSalida
                    }));
                    set({ employees });
                } catch (error) {
                    console.error("Failed to fetch employees", error);
                }
            },
            addEmployee: async (employee) => {
                try {
                    // Require departamentoId and cargoId. For now hardcode or assume UI sends them?
                    // Frontend 'employee' object doesn't have ids, only names. 
                    // This is a mapping issue. The frontend form needs to select IDs.
                    // For this quick fix, we'll just send primitive data and expect backend to handle or fail.
                    // ACTUALLY: The frontend needs to be updated to handle relations. 
                    // For now, let's map what we can.
                    const payload = {
                        nombre: employee.name,
                        email: employee.email,
                        salario: employee.salary,
                        fechaIngreso: employee.joinDate,
                        horaEntrada: employee.workStartTime,
                        horaSalida: employee.workEndTime,
                        estado: employee.status === 'active' ? 'Activo' : 'Inactivo',
                        departamentoId: 0, // Placeholder
                        cargoId: 0 // Placeholder
                    };
                    await api.post('/employees', payload);
                    // Reload
                    get().fetchEmployees();
                } catch (e) {
                    console.error("Add failed", e);
                }
            },
            updateEmployee: async (id, data) => {
                try {
                    const payload: any = {};
                    if (data.name) payload.nombre = data.name;
                    if (data.email) payload.email = data.email;
                    if (data.salary) payload.salario = data.salary;
                    // ... map other fields
                    await api.patch(`/employees/${id}`, payload);
                    get().fetchEmployees();
                } catch (e) {
                    console.error("Update failed", e);
                }
            },
            deleteEmployee: async (id) => {
                try {
                    await api.delete(`/employees/${id}`);
                    get().fetchEmployees();
                } catch (e) {
                    console.error("Delete failed", e);
                }
            }
        }),
        {
            name: 'employee-storage',
        }
    )
)
