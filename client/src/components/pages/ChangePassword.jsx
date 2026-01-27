import { useState } from "react"
import { useNavigate } from "react-router-dom"

function ChangePassword() {
    const navigate = useNavigate()
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleChangePassword = (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setSuccess('')

        if (!oldPassword.trim() || !newPassword.trim() || !newPasswordConfirm.trim()) {
            setError('Ошибка! Заполните все поля!')
            return
        }
        if (newPassword !== newPasswordConfirm) {
            setError('Ошибка! Новые пароли не совпадают!')
            return
        }
        if (oldPassword === newPassword) {
            setError('Ошибка! Новый пароль не может совпадать со старым!')
            return
        }

        const data_to_fetch = {
            old_password: oldPassword,
            new_password: newPassword,
            new_password_confirm: newPasswordConfirm
        }

        fetch(`http://localhost:8000/users/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data_to_fetch)
        })
            .then(response => {
                if (!response.ok) {
                    setIsLoading(false)
                    return response.json().then(err => { throw new Error(err.detail) })
                }
                return response.json()
            })
            .then(data => {
                setError('')
                setSuccess('Пароль успешно изменен!')
                setIsLoading(false)
                setOldPassword('')
                setNewPassword('')
                setNewPasswordConfirm('')
            })
            .catch(err => {
                setIsLoading(false)
                setError(`${err.message || 'Ошибка! Не удалось сменить пароль'}`)
            })
    }

    return (
        <>
            <h2>Смена пароля</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {success && <div style={{ color: 'green' }}>{success}</div>}
            <form action="" method="post" onSubmit={handleChangePassword}>
                <label htmlFor="old_password">Старый пароль</label>
                <input
                    type="password"
                    placeholder="Старый пароль"
                    name="old_password"
                    id="old_password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                />
                <label htmlFor="new_password">Новый пароль</label>
                <input
                    type="password"
                    placeholder="Новый пароль"
                    name="new_password"
                    id="new_password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <label htmlFor="new_password_confirm">Новый пароль (повторно)</label>
                <input
                    type="password"
                    placeholder="Новый пароль (повторно)"
                    name="new_password_confirm"
                    id="new_password_confirm"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? '......' : 'Сменить пароль'}
                </button>
                <button onClick={() => { navigate('/dashboard') }}>Вернуться в личный кабинет</button>
            </form>
        </>
    )
}

export default ChangePassword