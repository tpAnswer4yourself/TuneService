import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminPanel() {
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [idname, setIdname] = useState('')

    useEffect(() => {
        console.log('Попытка фетч запроса')
        getTracks()
    }, [])

    const getTracks = async () => {
        console.log('начинаем фетчить')
        setError('')
        setIsLoading(true)
        try {
            const response = await fetch(`http://localhost:8000/users/all`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (!response.ok) {
                const err = await response.json()
                console.log('ошибка!!')
                throw new Error(err.detail || 'Ошибка загрузки')
            }
            console.log('успешнО!')
            const data = await response.json()
            setUsers(data)
        }
        catch (err) {
            setError(err.message)
            setUsers('')
        }
        finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <h1>Панель управления</h1>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {isLoading && <h3>Загрузка...</h3>}
            <h2>Всего пользователей в системе = {users.length}</h2>
            <button onClick={() => { navigate('/dashboard') }}>Вернуться в личный кабинет</button>
        </>
    )
}

export default AdminPanel