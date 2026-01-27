import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Track from '../Track/Track'

function SearchTrack() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [idname, setIdname] = useState('')
    const [track, setTrack] = useState(null)
    const [isLoadCard, setIsLoadCard] = useState(false)

    const getTracks = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)
        try {
            const response = await fetch(`http://localhost:8000/tracks/search_id=${idname}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.detail || 'Ошибка загрузки')
            }
            const data = await response.json()
            setTrack(data)
            setIsLoadCard(true)
        }
        catch (err) {
            setError(err.message)
            setIsLoadCard(false)
            setTrack(null)
        }
        finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div>
                <h1>Поиск трека по ID</h1>
                {error && <div style={{ color: 'red' }}>{error}</div>}
                {isLoading && <h3>Загрузка треков</h3>}
                {!isLoading && !error && <p>Введите id трека</p>}
                <form action="" method="get" onSubmit={getTracks}>
                    <input
                        type="number"
                        name="id"
                        id="id"
                        value={idname}
                        onChange={(e) => setIdname(e.target.value)}
                        placeholder='Введите id трека'
                    />
                    <button type="submit">Найти</button>
                </form>
                {isLoadCard && <Track track={track} />}
            </div>
        </>
    )
}

export default SearchTrack