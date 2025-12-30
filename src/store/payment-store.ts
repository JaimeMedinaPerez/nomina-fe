import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PaymentRecord {
    id: string
    employeeId: string
    employeeName: string
    amount: number
    date: string
    period: string // e.g. "2023-10"
    reference?: string
    voucherUrl?: string // Simulated URL/path
    status: 'pending' | 'paid'
}

// @ts-ignore
import { api } from '../lib/api';

interface PaymentState {
    payments: PaymentRecord[]
    isLoading: boolean
    fetchPayments: () => Promise<void>
    approvePayment: (payment: any) => Promise<void>
    deletePayment: (id: string) => Promise<void>
    getPaymentForPeriod: (employeeId: string, period: string) => PaymentRecord | undefined
}

export const usePaymentStore = create<PaymentState>()(
    persist(
        (set, get) => ({
            payments: [],
            isLoading: false,
            fetchPayments: async () => {
                try {
                    set({ isLoading: true });
                    const data = await api.get('/payments');
                    console.log("Raw Payments Data:", data); // Temporary debug
                    const payments = data.map((p: any) => ({
                        id: p.id.toString(),
                        employeeId: p.usuario?.id?.toString() || p.usuarioId?.toString() || p.empleadoId?.toString(),
                        employeeName: p.usuario ? p.usuario.nombre : (p.empleado ? p.empleado.nombre : 'Usuario'),
                        amount: Number(p.netoAPagar || 0),
                        date: p.fechaPago,
                        period: p.periodo,
                        reference: p.referencia,
                        voucherUrl: p.urlComprobante,
                        status: p.estado.toLowerCase()
                    }));
                    set({ payments, isLoading: false });
                } catch (e) {
                    console.error("Fetch payments failed", e);
                    set({ isLoading: false });
                }
            },
            approvePayment: async (paymentData) => {
                try {
                    const payload = {
                        usuarioId: parseInt(paymentData.employeeId),
                        fechaPago: new Date().toISOString().split('T')[0],
                        periodo: paymentData.period,
                        estado: 'Pagado',
                        totalIngresos: paymentData.amount,
                        netoAPagar: paymentData.amount,
                        referencia: paymentData.reference,
                        urlComprobante: paymentData.voucherUrl
                    };
                    console.log("Approving Payment Payload:", payload);
                    await api.post('/payments', payload);
                    get().fetchPayments();
                } catch (e) {
                    alert('Error al aprobar pago');
                    console.error(e);
                }
            },
            deletePayment: async (id) => {
                try {
                    await api.delete(`/payments/${id}`);
                    get().fetchPayments();
                } catch (e) {
                    console.error("Delete failed", e);
                }
            },
            getPaymentForPeriod: (employeeId, period) => {
                return get().payments.find(p => p.employeeId.toString() === employeeId.toString() && p.period === period)
            }
        }),
        {
            name: 'payment-storage',
            partialize: (_state) => ({ payments: [] as PaymentRecord[] }), // Don't persist
        }
    )
)
