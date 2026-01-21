import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Track from '../Track'

function AllTracks() {
    const navigate = useNavigate()
    const [tracks, setTracks] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    

    const getTracks = async () => {
        setError('')
        setIsLoading(true)
        try {
            const response = await fetch(`http://localhost:8000/tracks/all`, {
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
            data.sort((a, b) => b.id - a.id)
            setTracks(data)
        }
        catch (err) {
            setError(err.message)
            setTracks('')
        }
        finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getTracks()
    }, [])

    return (
        <>
            <div>
                <h1>Все треки</h1>
                {error && <div style={{ color: 'red' }}>{error}</div>}
                {isLoading && <h3>Загрузка треков</h3>}
                {!isLoading && !error && tracks.length === 0 && <p>Треков пока нет</p>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {tracks.map(track => (
                        <Track key={track.id} track={track} />
                    ))}
                </div>
                <button onClick={() => { navigate('/dashboard') }}>Вернуться в личный кабинет</button>
            </div>
        </>
    )
}

export default AllTracks