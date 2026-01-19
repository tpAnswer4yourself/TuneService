import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

function Register() {
    const navigate = useNavigate()

    useEffect(() => {
        if (localStorage.getItem('token') !== null) {
            navigate('/dashboard')
        }
    }, [])

    const [Username, setUsername] = useState('')
    const [Email, setEmail] = useState('')
    const [Fullname, setFullname] = useState('')
    const [Password, setPassword] = useState('')
    const [PasswordConfirm, setPasswordConfirm] = useState('')
    const [Error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const SubmitReg = (e) => {
        e.preventDefault()
        setError('')

        if (!Username.trim() || !Email.trim() || !Password.trim() || !PasswordConfirm.trim()) {
            setError('Заполните все поля!!!')
            alert('Заполните все поля!!!')
            return
        }
        if (Password !== PasswordConfirm) {
            setError('Введенные пароли не должны отличаться!')
            alert('Введенные пароли не должны отличаться!')
            return
        }
        if (!Email.includes('@')) {
            setError('Почта должна содержать знак "@"')
            alert('Почта должна содержать знак "@"')
            return
        }

        const data_to_fetch = {
            username: Username,
            email: Email,
            full_name: Fullname,
            password_hash: Password
        }

        setIsLoading(true)
        fetch(`http://localhost:8000/users/registrate`, {
            method: 'POST',
            body: JSON.stringify(data_to_fetch),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.detail) })
                }
                return response.json()
            })
            .then(data => {
                setUsername('')
                setEmail('')
                setFullname('')
                setPassword('')
                setPasswordConfirm('')
                setError('')
                setIsLoading(false)
                navigate('/login')
                alert('Вы зарегистрировались!')
            })
            .catch(err => {
                setError(`${err}`)
            })
    }

    return (
        <>
            <form action="" method="post" onSubmit={SubmitReg}>
                <h1>Регистрация</h1>
                <input
                    type="text"
                    placeholder="username"
                    id="username"
                    name="username"
                    value={Username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="full name (optional)"
                    id="fullname"
                    name="fullname"
                    value={Fullname}
                    onChange={(e) => setFullname(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="email"
                    id="email"
                    name="email"
                    value={Email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="password"
                    id="password"
                    name="password"
                    value={Password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="password confirm"
                    id="password_confirm"
                    name="password_confirm"
                    value={PasswordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                />
                {Error && <div style={{ color: 'red' }}>{Error}</div>}
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
                <Link to={"/login"}>Уже есть аккаунт? Войти</Link>
            </form>
        </>
    )
}

export default Register