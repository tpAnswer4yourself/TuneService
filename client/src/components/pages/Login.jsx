import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

function Login() {
    const navigate = useNavigate()

    useEffect(() => {
        if (localStorage.getItem('token') !== null) {
            navigate('/dashboard')
        }
    }, []) //пустой массив - проверка при появлении компонента login

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
                return fetch('http://localhost:8000/users/me', {
                    headers: { 'Authorization': `Bearer ${data.access_token}` }
                })
                    .then(res => {
                        if (!res.ok) {
                            return res.json().then(err => { throw new Error(err.detail) })
                        }
                        return res.json()
                    })
                    .then(user => {
                        localStorage.setItem('role', user.role)
                        setUsername('')
                        setPassword('')
                        setError('')
                        navigate('/dashboard')
                        alert('Вы авторизировались!')
                    })
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
                <Link to={"/register"}>Нет аккаунта? Зарегистрироваться</Link>
            </form>
        </>
    )
}

export default Login