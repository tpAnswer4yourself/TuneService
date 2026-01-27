import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Track from '../Track/Track'

function AllTracks() {
    const navigate = useNavigate()
    const [tracks, setTracks] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [sorting, setSorting] = useState(true)

    const handleSortTracks = () => {
        const newSorting = !sorting
        setSorting(newSorting)
        getTracks(newSorting)
    }

    const CallBackDeleteTrack = (delete_id) => {
        setTracks(prev => prev.filter(track => track.id !== delete_id))
        alert('Трек успешно удален!')
    }

    const getTracks = async (shouldSort) => {
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

            if (shouldSort) {
                data.sort((a, b) => b.id - a.id)
            }
            else {
                data.sort((a, b) => a.id - b.id)
            }
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
        getTracks(sorting)
    }, [])

    return (
        <>
            <div>
                <h1>Все треки</h1>
                <button onClick={handleSortTracks}>Изменить порядок</button>
                {error && <div style={{ color: 'red' }}>{error}</div>}
                {isLoading && <h3>Загрузка треков</h3>}
                {!isLoading && !error && tracks.length === 0 && <p>Треков пока нет</p>}
                <button onClick={() => { navigate('/dashboard') }}>Вернуться в личный кабинет</button>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {tracks.map(track => (
                        <Track key={track.id}
                            track={track}
                            onDelete={CallBackDeleteTrack}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}

export default AllTracks