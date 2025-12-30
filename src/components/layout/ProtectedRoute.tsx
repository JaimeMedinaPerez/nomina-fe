import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore, type UserRole } from '@/store/auth-store'

interface ProtectedRouteProps {
    children: React.ReactNode
    allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user } = useAuthStore()
    const location = useLocation()

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their default dashboard if unauthorized for this specific route
        return <Navigate to={user.role === 'admin' ? '/admin' : '/worker'} replace />
    }

    // Render content
    return <>{children}</>
}
