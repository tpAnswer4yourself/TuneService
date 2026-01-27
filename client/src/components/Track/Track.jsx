import { useContext, useState, useEffect } from "react"
import { PlayerContext } from "../../contexts/PlayerContext"
import DeleteTrack from "../pages/DeleteTrack"
import AddFavoriteTrack from "../pages/AddFavoriteTrack"
import DeleteFavoriteTrack from "../pages/DeleteFavoriteTrack"
import { UseNotification } from "../../hooks/useNotification"

export const checkFavoriteTrack = async (trackId) => {
    try {
        const response = await fetch(`http://localhost:8000/favorite/track/${trackId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        if (response.status === 401) {
            console.log('Ошибка 401! Неавторизован')
            return false
        }

        if (!response.ok) {
            console.log('Ошибка при проверке избранного')
            return false
        }
        const data = await response.json()
        const result = data.is_favorite
        if (result) {
            return true
        }
        return false
    }
    catch (err) {
        console.log('Ошибка: ', err)
        return false
    }
}

export const loadCoverForTrack = async (trackId) => {
    try {
        const response = await fetch(`http://localhost:8000/tracks/cover/${trackId}`, {
            method: 'GET'
        })
        if (response.status === 401) {
            return null
        }

        if (!response.ok) {
            console.log('Ошибка при загрузке обложки')
            return null
        }

        const blob = await response.blob()
        const imageURL = URL.createObjectURL(blob)
        return imageURL
    }
    catch (err) {
        console.log('Ошибка: ', err)
        return false
    }
}

function Track({ track, onDelete, onDeleteFavorite }) {
    const { currentTrack, playTrack, isPlaying, togglePlayPause, addToQueue } = useContext(PlayerContext)

    const [isFavorite, setIsFavorite] = useState(false)
    const [CoverUrl, SetCoverUrl] = useState(null)

    const isCurrentTrack = currentTrack?.id === track.id

    const notify = UseNotification()

    const playbutton = () => {
        if (track.id !== currentTrack?.id) {
            playTrack(track)
            return
        }
        togglePlayPause()
    }

    const handleDeleteTrack = async () => {
        try {
            await DeleteTrack(track.id)

            if (onDelete) {
                onDelete(track.id)
            }
        }
        catch (err) {
            console.log('Ошибка: ', err)
        }
    }

    const handleAddFavoriteTrack = async () => {
        try {
            const result = await AddFavoriteTrack(track.id)
            setIsFavorite(true)
            console.log('трек добавлен: ', result)
            notify.success('Трек добавлен в любимые!', 4000)
        }
        catch (err) {
            console.log('Ошибка: ', err)
        }
    }

    const handleDeleteFavoriteTrack = async () => {
        try {
            const result = await DeleteFavoriteTrack(track.id)
            setIsFavorite(false)
            if (onDeleteFavorite) {
                onDeleteFavorite(track.id)
            }
            console.log('трек удален: ', result)
            notify.warning('Трек удален из любимых!', 4000)
        }
        catch (err) {
            console.log('Ошибка: ', err)
        }
    }

    const handleAddToQueue = () => {
        addToQueue(track)
        notify.info('Трек добавлен в очередь', 4000)
    }

    useEffect(() => {
        const loadFavoriteStatus = async () => {
            const status = await checkFavoriteTrack(track.id)
            setIsFavorite(status)
        }
        loadFavoriteStatus()
    }, [track.id])

    useEffect(() => {
        const loadCover = async () => {
            if (!track.cover_path) {
                SetCoverUrl(null)
                return
            }
            try {
                const URL = await loadCoverForTrack(track.id)
                SetCoverUrl(URL)
            }
            catch (err) {
                console.log('Ошибка загрузки обложки: ', err)
            }
        }
        loadCover()

        return () => {
            if (CoverUrl) {
                URL.revokeObjectURL(CoverUrl)
            }
        }
    }, [track.id, track.cover_path])

    return <>
        <div className="track-card"
            style={{
                background: isCurrentTrack && isPlaying ? '#3e3944' : '#3e3e3e',
                padding: '20px',
                margin: '20px',
                borderRadius: '30px',
                transition: '0.1s ease-in',
                color: '#ffffff',
                border: isCurrentTrack && isPlaying ? '2px solid #593c4f' : '2px solid #505050',
                filter: isCurrentTrack && isPlaying ? `drop-shadow(0px 0px 17px rgba(187, 87, 165, 0.2))` : `drop-shadow(0px 0px 17px rgba(187, 87, 165, 0.15))`
            }}>
            <div style={{
                width: 'auto',
                height: '340px',
                borderRadius: '20px',
                background: '#242424',
                display: 'flex',
                justifyContent: 'center',
                fontSize: '100px',
                alignItems: 'center'
            }}>
                {CoverUrl ? (
                    <img
                        src={CoverUrl}
                        alt="Не удалось загрузить :("
                        style={{
                            width: '97%',
                            height: '97%',
                            objectFit: 'cover',
                            borderRadius: '15px'
                        }} />
                ) : ('🎧')}
            </div>
            <div style={{
                padding: '0px',
                fontWeight: '600',
                fontSize: '1.65rem'
            }}>
                <p style={{
                    marginBottom: '0'
                }}>
                    {track.title}
                </p>
                <p style={{
                    marginTop: '0.25rem',
                    fontSize: '1.1rem'
                }}>
                    {track.artist}
                </p>
            </div>
            <button onClick={handleDeleteTrack}
                style={{
                    background: 'red',
                    margin: '10px'
                }}>
                delBD
            </button>
            <button
                onClick={() => { playbutton() }}>
                {isCurrentTrack && isPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={isFavorite ? handleDeleteFavoriteTrack : handleAddFavoriteTrack}
                style={{
                    background: isFavorite ? '#cecece' : '#5cee68',
                    margin: '10px',
                    fontSize: '18px'
                }}>
                {isFavorite ? '❤️' : '+'}
            </button>
            <button onClick={handleAddToQueue}>⏭️</button>
        </div>

    </>
}

export default Track

//background: isCurrentTrack && isPlaying ? '#d8cfe5' : '#ffffff',
/* 
<p>Загружен: {new Date(track.created_at).toLocaleDateString()}</p>
<p>ID: {track.id}</p>
*/