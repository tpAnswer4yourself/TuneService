import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
    const navigate = useNavigate()
    //потом КРИТИЧНО ВАЖНО!!! НУЖНО перенести в useEffect
    if (localStorage.getItem('token') !== null) {
        navigate('/dashboard')
    }
    // добавление состояний UseState()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const SubmitAuth = (e) => {
        e.preventDefault()

        setError('')

        if (!username.trim() || !password.trim()) {
            setError('Заполните все поля!')
            alert('Заполните все поля!')
            return
        }

        fetch(`http://localhost:8000/users/login`, {
            method: 'POST',
            body: new FormData(e.target)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.detail) })
                }
                return response.json()
            })
            .then(data => {
                localStorage.setItem('token', data.access_token)
                setUsername('')
                setPassword('')
                setError('')
                navigate('/dashboard')
                alert('Вы авторизировались!')
            })
            .catch(error => {
                setError(`${error}`)
            })
    }

    return (
        <>
            <form method="post" onSubmit={SubmitAuth} id='login-form'>
                <h1>Вход</h1>
                <input
                    type="text"
                    placeholder="username"
                    id="username"
                    name='username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="password"
                    id="password"
                    name='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <div style={{ color: 'red' }}>{error}</div>}
                <button type="submit">Войти</button>
                <a href="/register">Нет аккаунта? Зарегистрироваться</a>
            </form>
        </>
    )
}

export default Login