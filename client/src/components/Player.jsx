import { useContext, useEffect, useState } from "react"
import { PlayerContext } from "../context/PlayerContext"

function Player() {
    const { currentTrack, isPlaying, togglePlayPause, audioRef, setCurrentTrack, setIsPlaying,
        changeVolume, volume, duration, currentTime, replayToTime, setCurrentTime, setDuration } = useContext(PlayerContext)
    const [volumeLast, setVolumeLast] = useState(volume)

    const closePanel = () => {
        if (audioRef.current) {
            audioRef.current.src = ''
            audioRef.current.currentTime = 0
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
            if (volumeLast === null) {
                volumeLast = 1
            }
            changeVolume(volumeLast)
        }
    }

    useEffect(() => {
        if (audioRef.current) {
            const dur = audioRef.current.duration
            setDuration(isNaN(dur) || !isFinite(dur) ? 0 : dur)

            audioRef.current.onloadedmetadata = () => {

                const dur = audioRef.current.duration
                console.log(`audioRef.current.duratiom^^^^ ${audioRef.current.duration}`)
                setDuration(isNaN(dur) || !isFinite(dur) ? 0 : dur)
            }

            audioRef.current.ontimeupdate = () => {
                console.log(`audioRef.current.currentTime^^^^ ${audioRef.current.currentTime}`)
                setCurrentTime(audioRef.current.currentTime || 0)
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
                        right: '22%',
                        left: '22%',
                        background: isPlaying ? '#6214ff7c' : '#7b39ff7c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        height: '50px',
                        zIndex: 1000,
                        width: '56%',
                        borderRadius: '35px',
                        marginTop: '15px',
                        transition: '0.07s ease-in'
                    }}>
                <h2>{currentTrack ? currentTrack.title + ' - ' : 'ничего не играет'}{currentTrack ? currentTrack.artist : ''}</h2>
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
                <button onClick={closePanel}>X</button>
            </div>
        </>
    )
}

export default Player