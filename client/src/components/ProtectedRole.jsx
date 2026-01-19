import { Navigate } from "react-router-dom"

function ProtectedRole({children}) {
    const role = localStorage.getItem('role')
    if(role !== 'admin') {
        return <Navigate to="/dashboard" replace />
    }

    return <>{children}</>
}

export default ProtectedRole