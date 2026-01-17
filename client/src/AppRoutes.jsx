import { createRoot } from 'react-dom/client'
import { Route, Routes } from 'react-router-dom'
import Dashboard from './components/pages/Dashboard'
import Login from './components/pages/Login'
import Register from './components/pages/Register'

function AppRoutes() {
    return (
        <Routes>
            <Route path='/' element={<Login />}/>
            <Route path='/login' element={<Login />}/>
            <Route path='/register' element={<Register />}/>
            <Route path='/dashboard' element={<Dashboard />}/>
        </Routes>
    )
}

export default AppRoutes