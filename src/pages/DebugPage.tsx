import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export function DebugPage() {
    const [users, setUsers] = useState<any[]>([])
    const [payments, setPayments] = useState<any[]>([])

    useEffect(() => {
        api.get('/auth/users').then((data: any) => setUsers(Array.isArray(data) ? data : []))
        api.get('/payments').then((data: any) => setPayments(Array.isArray(data) ? data : []))
    }, [])

    return (
        <div className="p-8 bg-slate-950 min-h-screen text-white font-mono text-xs">
            <h1 className="text-xl font-bold mb-4 text-red-500">SYSTEM DIAGNOSTICS</h1>

            <div className="grid grid-cols-2 gap-8">
                <div>
                    <h2 className="text-lg font-bold text-blue-400 mb-2">USERS (Tabla Usuarios)</h2>
                    <table className="w-full border border-blue-900">
                        <thead>
                            <tr className="bg-blue-900/30">
                                <th className="p-1 border border-blue-900">ID</th>
                                <th className="p-1 border border-blue-900">Nombre</th>
                                <th className="p-1 border border-blue-900">Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td className="p-1 border border-blue-900 text-yellow-400">{u.id}</td>
                                    <td className="p-1 border border-blue-900">{u.nombre}</td>
                                    <td className="p-1 border border-blue-900">{u.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-green-400 mb-2">PAYMENTS (Tabla Pagos)</h2>
                    <table className="w-full border border-green-900">
                        <thead>
                            <tr className="bg-green-900/30">
                                <th className="p-1 border border-green-900">ID</th>
                                <th className="p-1 border border-green-900">UsuarioID</th>
                                <th className="p-1 border border-green-900">Periodo</th>
                                <th className="p-1 border border-green-900">Monto</th>
                                <th className="p-1 border border-green-900">Estado</th>
                                <th className="p-1 border border-green-900">Ref</th>
                                <th className="p-1 border border-green-900">Url</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(p => (
                                <tr key={p.id}>
                                    <td className="p-1 border border-green-900">{p.id}</td>
                                    <td className="p-1 border border-green-900 text-yellow-400 font-bold">{p.usuarioId || p.empleadoId || 'NULL'}</td>
                                    <td className="p-1 border border-green-900">{p.periodo}</td>
                                    <td className="p-1 border border-green-900 text-white">{p.netoAPagar}</td>
                                    <td className="p-1 border border-green-900">{p.estado}</td>
                                    <td className="p-1 border border-green-900">{p.referencia}</td>
                                    <td className="p-1 border border-green-900 max-w-[100px] truncate">{p.urlComprobante}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
