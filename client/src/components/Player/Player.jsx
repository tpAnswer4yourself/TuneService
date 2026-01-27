import { useContext, useEffect, useState } from "react"
import { PlayerContext } from "../../contexts/PlayerContext"
import { checkFavoriteTrack, loadCoverForTrack } from '../Track/Track'
import AddFavoriteTrack from "../pages/AddFavoriteTrack"
import DeleteFavoriteTrack from "../pages/DeleteFavoriteTrack"
import { UseNotification } from "../../hooks/useNotification"

function Player() {
    const { currentTrack, isPlaying, togglePlayPause, audioRef, setCurrentTrack, setIsPlaying,
        changeVolume, volume, duration, currentTime, replayToTime, setCurrentTime, setDuration, playNext, addToQueue, queue, currentIndex } = useContext(PlayerContext)
    const [volumeLast, setVolumeLast] = useState(volume)
    const [isFavorite, setIsFavorite] = useState(false)
    const token = localStorage.getItem('token')
    const [CoverUrl, SetCoverUrl] = useState(null)
    const notify = UseNotification()

    const closePanel = () => {
        if (audioRef.current) {
            // ВРЕМЕННЫЙ ФИКС
            // Используем очистку (НО ЛУЧШЕ ВЕШАТЬ СЛУШАТЕЛИ НА АУДИО)
            audioRef.current.onloadedmetadata = null
            audioRef.current.ontimeupdate = null
            // конец ошибки, которая всплывала
            audioRef.current.src = ''
            audioRef.current.currentTime = 0
            audioRef.current.load()
        }
        setCurrentTrack(null)
        setIsPlaying(false)
    }

    useEffect(() => {
        if (!token) {
            closePanel()
        }
    }, [token])

    const toggleSound = () => {
        if (volume > 0) {
            setVolumeLast(volume)
            changeVolume(0)
        }
        else {
            if (volumeLast === null) {
                volumeLast = 1
            }
            changeVolume(volumeLast)
        }
    }

    const handleAddFavorite = async () => {
        try {
            const result = await AddFavoriteTrack(currentTrack.id)
            setIsFavorite(true)
            if (result) {
                console.log('Успешно добавлен!')
                notify.success('Трек добавлен в любимые!', 4000)
            }
        }
        catch (err) {
            console.log('Ошибка: ', err)
        }
    }

    const handleDeleteFavorite = async () => {
        try {
            const result = await DeleteFavoriteTrack(currentTrack.id)
            setIsFavorite(false)
            if (!result) {
                console.log('Успешно удален!')
                notify.warning('Трек удален из любимых!', 4000)
            }
        }
        catch (err) {
            console.log('Ошибка: ', err)
        }
    }

    useEffect(() => {
        const handleUnAthorized = (e) => {
            if (e.key === 'token' && !e.newValue) {
                closePanel()
            }
        }
        window.addEventListener('storage', handleUnAthorized)
        return () => window.removeEventListener('storage', handleUnAthorized)
    }, [])

    useEffect(() => {
        if (audioRef.current) {
            const dur = audioRef.current.duration
            setDuration(isNaN(dur) || !isFinite(dur) ? 0 : dur)

            audioRef.current.onloadedmetadata = () => {
                const dur = audioRef.current.duration
                setDuration(isNaN(dur) || !isFinite(dur) ? 0 : dur)
            }

            audioRef.current.ontimeupdate = () => {
                setCurrentTime(audioRef.current.currentTime || 0)
            }

            audioRef.current.onended = () => {
                console.log('Трек закончился! Включаем следующий...')
                playNext()
            }
        }
    })

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume
        }
    }, [volume])

    useEffect(() => {
        if (volume > 0) {
            setVolumeLast(volume)
        }
    }, [volume])

    useEffect(() => {
        console.log("useEffect сработал. currentTrack:", currentTrack?.title, "isPlaying:", isPlaying)
        if (currentTrack && audioRef.current) {
            console.log("Устанавливаем src:", `http://localhost:8000/tracks/stream/${currentTrack.id}`)
            audioRef.current.src = `http://localhost:8000/tracks/stream/${currentTrack.id}`
            audioRef.current.load()
            audioRef.current.volume = volume

            if (isPlaying) {
                console.log("Пытаемся играть...")
                audioRef.current.play()

                //Обновление кнопки "фаворит" после того, как загружен трек
                const loadFavoriteStatus = async () => {
                    const status = await checkFavoriteTrack(currentTrack?.id)
                    setIsFavorite(status)
                }
                loadFavoriteStatus()
                    //конец

                    .catch(e => {
                        console.log('Ошибка:', e.name, e.message)
                    })
            }
        }
    }, [currentTrack])

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.log("Play заблокирован:", e))
            } else {
                audioRef.current.pause()
            }
        }
    }, [isPlaying])

    useEffect(() => {
        const loadCover = async () => {
            if (!currentTrack?.cover_path) {
                SetCoverUrl(null)
                return
            }
            try {
                const URL = await loadCoverForTrack(currentTrack?.id)
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
    }, [currentTrack])

    useEffect(() => {
        if (currentIndex >= 0 && currentIndex < queue.length) {
            setCurrentTrack(queue[currentIndex])
            setIsPlaying(true)
        }
    }, [currentIndex, queue])

    if (!currentTrack) {
        return null
    }

    return (
        <>
            <div className="player-bg"
                style={
                    {
                        fontSize: '12px',
                        position: 'fixed',
                        bottom: 'auto',
                        top: 0,
                        right: '20%',
                        left: '20%',
                        background: localStorage.getItem('col-bg-player') || '#353535',
                        border: '2px solid #0f0f0f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        height: '50px',
                        zIndex: 1000,
                        maxWidth: '60%',
                        borderRadius: '20px',
                        marginTop: '15px',
                        transition: '0.07s ease-in'
                    }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '5px',
                    background: '#ffffff',
                    display: 'flex',
                    justifyContent: 'center',
                    fontSize: '16px',
                    alignItems: 'center'
                }}>
                    {CoverUrl ? (
                        <img
                            src={CoverUrl}
                            alt="Не удалось загрузить :("
                            style={{
                                width: '95%',
                                height: '95%',
                                objectFit: 'cover',
                                borderRadius: '3px'
                            }} />
                    ) : ('🎧')}
                </div>
                <h2 style={{
                    fontSize: '16px'
                }}>{currentTrack ? currentTrack.title + ' - ' : 'ничего не играет'}{currentTrack ? currentTrack.artist : ''}</h2>
                <input
                    type="range"
                    min={0}
                    max={duration - 1}
                    step={0.1}
                    value={currentTime || 0}
                    onChange={(e) => replayToTime(Number(e.target.value))}
                    style={{
                        width: '225px',
                        cursor: 'pointer',
                        outline: 'none',
                        background: 'linear-gradient(to right, #e9e9ff, #ffdbdb)',
                        appearance: 'none',
                        borderRadius: '20px'
                    }}
                />
                <span>{parseFloat((currentTime).toFixed(0))} / {Math.floor(duration)}</span>
                <button onClick={toggleSound} style={{
                    background: volume > 0 ? '#5cee68' : '#ee5c5c'
                }}>
                    {volume > 0 ? '🔊' : '🔇'}
                </button>
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => {
                        const newVol = Number(e.target.value)
                        changeVolume(newVol)
                        if (newVol > 0) {
                            setVolumeLast(newVol)
                        }
                    }}
                    style={{
                        width: '100px',
                        cursor: 'pointer',
                        outline: 'none',
                        background: 'linear-gradient(to right, #e7c9ff, #f89ceb)',
                        appearance: 'none',
                        borderRadius: '20px'
                    }}
                />
                <span>{parseFloat((volume * 100).toFixed(1))}%</span>
                <button onClick={togglePlayPause} hidden={!currentTrack}>
                    {isPlaying ? '⏸' : '▶'}
                </button>
                <audio ref={audioRef} />
                <button onClick={isFavorite ? handleDeleteFavorite : handleAddFavorite}
                    style={{
                        background: isFavorite ? '#e1e1e1' : '#5cee68'
                    }}>
                    {isFavorite ? '-' : '+'}
                </button>
                <button onClick={playNext}>⏭️</button>
                <button onClick={closePanel}>X</button>
            </div>
        </>
    )
}



export default Player

//background: localStorage.getItem('col-bg-player') ? '#46334f' : '#444444',