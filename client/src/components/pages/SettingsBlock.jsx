import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function SettingsBlock() {
    const navigate = useNavigate()
    const [colorPlayer, setColorPlayer] = useState(localStorage.getItem('col-bg-player') || '#00ff22')

    const handleSavePlayer = () => {
        if (!localStorage.getItem('col-bg-player')) {
            localStorage.setItem('col-bg-player', colorPlayer)
        }
        else {
            localStorage.setItem('col-bg-player', colorPlayer)
        }
    }
    return (
        <>
            <div style={{
                background: 'linear-gradient(to top, #232528, #2a2a34)',
                padding: '100px',
                borderRadius: '35px',
                fontSize: '1.1rem'
            }}>
                <h1>Настройки</h1>
                <button onClick={() => { navigate('/dashboard') }}>Вернуться в личный кабинет</button>
                <label>Цвет</label>
                <input
                    type="color"
                    value={colorPlayer}
                    onChange={(e) => setColorPlayer(e.target.value)}
                    style={{
                        width: '5rem'
                    }} />
                <button onClick={handleSavePlayer}>Применить</button>
                <h3>Пример плеера</h3>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        width: '15rem',
                        height: '7rem',
                        background: colorPlayer,
                        color: '#ffffff',
                        textAlign: "center",
                        alignItems: 'center'
                    }}>
                        <h1>Play</h1>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SettingsBlock