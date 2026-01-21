import { createRoot } from 'react-dom/client'
import { Route, Routes } from 'react-router-dom'
import Dashboard from './components/pages/Dashboard'
import Login from './components/pages/Login'
import Register from './components/pages/Register'
import AdminPanel from './components/pages/AdminPanel'
import UploadTrack from './components/pages/UploadTrack'
import AllTracks from './components/pages/AllTracks'
import ChangePassword from './components/pages/ChangePassword'
import ProtectedRoute from './components/ProtectedRoute'
import ProtectedRole from './components/ProtectedRole'

function AppRoutes() {
    return (
        <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path='/dashboard/change-password' element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path='/upload-track' element={<ProtectedRoute><UploadTrack /></ProtectedRoute>} />
            <Route path='/all-tracks' element={<ProtectedRoute><AllTracks /></ProtectedRoute>} />
            <Route path='/dashboard/admin-panel' element={<ProtectedRoute><ProtectedRole><AdminPanel /></ProtectedRole></ProtectedRoute>} />
        </Routes>
    )
}

export default AppRoutes