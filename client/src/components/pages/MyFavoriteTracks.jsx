import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Track from '../Track/Track'

function MyFavoriteTracks() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [fav_tracks, setFav_tracks] = useState([])


    const CallBackDeleteTrackFavorite = (delete_id) => {
        setFav_tracks(prev => prev.filter(track => track.id !== delete_id))
        alert('Трек успешно удален!')
    }

    const getMyTracks = async () => {
        setError('')
        try {
            setIsLoading(true)
            const response = await fetch(`http://localhost:8000/favorite/my-tracks`, {
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
            setFav_tracks(data)
        }
        catch (err) {
            setError(err.message)
            console.log(err)
        }
        finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getMyTracks()
    }, [])

    return (
        <>
            <div style={{
                background: 'linear-gradient(to top, #28b226, #982f2f)',
                width: '95%',
                marginTop: '4rem',
                padding: '75px',
                borderRadius: '35px'
            }}>
                <h1>Мои избранные треки</h1>
                <button onClick={() => { navigate('/dashboard') }}>Вернуться в личный кабинет</button>
                {error && <div style={{ color: 'red' }}>{error}</div>}
                {isLoading && <h3>Загрузка треков...</h3>}
                {!isLoading && !error && fav_tracks.length === 0 && <p>Избранных треков пока нет</p>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {fav_tracks.map(track => (
                        <Track key={track.id}
                            track={track}
                            onDeleteFavorite={CallBackDeleteTrackFavorite}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}

export default MyFavoriteTracks