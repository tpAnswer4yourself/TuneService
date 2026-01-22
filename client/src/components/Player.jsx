import { useContext, useEffect, useState } from "react"
import { PlayerContext } from "../context/PlayerContext"

function Player() {
    const { currentTrack, isPlaying, togglePlayPause, audioRef, setCurrentTrack, setIsPlaying, changeVolume, volume } = useContext(PlayerContext)
    const token = localStorage.getItem('token')
    const [volumeLast, setVolumeLast] = useState(volume)

    if (!token) return null

    const closePanel = () => {
        console.log('сбрасываем трек')
        if (audioRef.current) {
            audioRef.current.src = ''
            audioRef.current.load()
        }
        setCurrentTrack(null)
        setIsPlaying(false)
    }

    const toggleSound = () => {
        if (volume > 0) {
            setVolumeLast(volume)
            changeVolume(0)
        }
        else {
            console.log(`volume and last: ${volume}, ${volumeLast}`)
            if (volumeLast === null) {
                volumeLast = 1
            }
            changeVolume(volumeLast)
        }
    }

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume
            console.log(`Громкость установлена на: ${volume}`)
        }
    }, [volume]) // Этот эффект будет срабатывать при изменении volume

    // Также обновляем volumeLast при изменении volume извне
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

            if (isPlaying) {
                console.log("Пытаемся играть...")
                //audioRef.current.playbackRate = 1.5 //скорость трека
                //audioRef.current.volume = 0.8 //громкость трека
                audioRef.current.play()
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

    if (!currentTrack) {
        return null
    }

    return (
        <>
            <div className="player-bg"
                style={
                    {
                        fontSize: '14px',
                        position: 'fixed',
                        bottom: 'auto',
                        top: 0,
                        right: '25%',
                        left: '25%',
                        background: isPlaying ? '#6214ff7c' : '#7b39ff7c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '50px',
                        height: '50px',
                        zIndex: 1000,
                        width: '50%',
                        borderRadius: '35px',
                        marginTop: '15px',
                        transition: '0.07s ease-in'
                    }}>
                <h2>{currentTrack ? currentTrack.title + ' - ' : 'ничего не играет'}{currentTrack ? currentTrack.artist : ''}</h2>
                <button onClick={toggleSound} style={{
                    background: volume > 0 ? 'green' : 'red'
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
                        cursor: 'pointer',
                        outline: 'none',
                        background: 'linear-gradient(to right, #e7c9ff, #f89ceb)',
                        appearance: 'none',
                        borderRadius: '20px'
                    }}
                />
                <button onClick={togglePlayPause} hidden={!currentTrack}>
                    {isPlaying ? '⏸' : '▶'}
                </button>
                <audio ref={audioRef} />
                <button onClick={closePanel}>X</button>
            </div>
        </>
    )
}

export default Player