import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchTrack from './SearchTrack'

function Dashboard() {
    const navigate = useNavigate()

    const toggleSearchTrack = () => {
        setSearchTrack(!searchtrack) // переключаем состояние
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        fetch(`http://localhost:8000/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (response.status === 401) {
                    localStorage.removeItem('token')
                    navigate('/login')
                    return
                }
                else if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.detail) })
                }
                return response.json()
            })
            .then(data => {
                setUser(data)
            })
            .catch(err => {
                setError(`${err}`)
            })

    }, [])

    const [user, setUser] = useState(null)
    const [searchtrack, setSearchTrack] = useState(false)

    const style_button = {
        backgroundColor: 'red',
        color: 'white'
    }

    if (!user) {
        return (
            <>
                <h1>Загрузка...</h1>
            </>
        )
    }
    else if (user.role === 'admin') {
        return (
            <>
                <h1>Личный кабинет</h1>
                <h2>Добро пожаловать, {user.username}!</h2>
                <div className='user-info'>
                    <h3>Ваши данные:</h3>
                    <ul>
                        <li><b>ID:</b> {user.id}</li>
                        <li><b>Логин:</b> {user.username}</li>
                        <li><b>Полное имя:</b> {user.full_name || 'Отсутсвует'}</li>
                        <li><b>Электронная почта:</b> {user.email}</li>
                        <li><b>Роль:</b> {user.role}</li>
                        <li><b>Дата создания аккаунта:</b> {new Date(user.created_at).toLocaleDateString()}</li>
                    </ul>
                </div>
                <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); navigate('/login') }} style={style_button}>Выйти</button >
                <button onClick={() => { navigate('/dashboard/admin-panel') }}>Админ-панель</button>
                <button onClick={() => { navigate('/upload-track') }}>Загрузить трек</button>
                <button onClick={toggleSearchTrack}>
                    {searchtrack ? 'Скрыть поиск' : 'Найти трек по ID'}
                </button>
                <button onClick={() => { navigate('/all-tracks') }}>Показать все треки</button>
                <button onClick={() => { navigate('/dashboard/my-tracks') }}>Мои треки❤️</button>
                <button onClick={() => { navigate('/dashboard/change-password') }}>Сменить пароль</button>
                {searchtrack && <SearchTrack />}
            </>
        )
    }
    else if (user.role === 'user') {
        return (
            <>
                <div style={{
                    background: 'linear-gradient(to top, #232528, #2a2a34)',
                    padding: '100px',
                    borderRadius: '35px',
                    marginTop: '4rem',
                    fontSize: '1.1rem'
                }}>
                    <h1>Личный кабинет</h1>
                    <div className='user-info' style={{
                        background: 'linear-gradient(to top, #313338, #313140)',
                        borderRadius: '15px',
                        padding: '10px',
                        margin: '1.5rem'
                    }}>
                        <h2>Добро пожаловать, {user.username}!</h2>
                        <h3 style={{}}>Ваши данные</h3>
                        <ul style={{
                            listStyle: 'none',
                            textAlign: 'left',
                            marginBottom: '2rem'
                        }}>
                            <li><b>Логин:</b> {user.username}</li>
                            <li><b>Полное имя:</b> {user.full_name || 'Отсутсвует'}</li>
                            <li><b>Электронная почта:</b> {user.email}</li>
                            <li><b>Дата создания аккаунта:</b> {new Date(user.created_at).toLocaleDateString()}</li>
                        </ul>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '2rem'
                    }}>
                        <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); navigate('/login') }} style={style_button}>Выйти</button >
                        <button onClick={() => { navigate('/upload-track') }}>Загрузить трек</button>
                        <button onClick={toggleSearchTrack}>
                            {searchtrack ? 'Скрыть поиск' : 'Найти трек по ID'}
                        </button>
                        <button onClick={() => { navigate('/all-tracks') }}>Показать все треки</button>
                        <button onClick={() => { navigate('/dashboard/my-tracks') }}>Мои треки❤️</button>
                        <button onClick={() => { navigate('/dashboard/change-password') }}>Сменить пароль</button>
                        <button onClick={() => { navigate('/dashboard/settings') }}>⚙️</button>
                    </div>
                    {searchtrack && <SearchTrack />}
                </div>
            </>
        )
    }

    else {
        return (
            <>
                <h1>Загрузка...</h1>
            </>
        )
    }
}

export default Dashboard