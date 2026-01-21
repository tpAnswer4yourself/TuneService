import { useContext, useEffect, useState } from "react"
import { PlayerContext } from "../context/PlayerContext"

function Player() {
    const { currentTrack, isPlaying, togglePlayPause, audioRef, setCurrentTrack } = useContext(PlayerContext)
    const [isClose, setIsClose] = useState(true)

    const closePanel = () => {
        setIsClose(true)
        console.log('сбрасываем трек')
        setCurrentTrack(null)
        audioRef.current.src = ``
        audioRef.current.load()
    }

    useEffect(() => {
        console.log("useEffect сработал. currentTrack:", currentTrack?.title, "isPlaying:", isPlaying)
        setIsClose(false)
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

    if (isClose === true) {
        <>
            <h1>Нету плеера</h1>
        </>
    }
    else {
        return (
            <>
                <div className="player-bg"
                    style={{
                        fontSize: '14px',
                        position: 'fixed',
                        bottom: 'auto',
                        top: 0,
                        right: '25%',
                        left: '25%',
                        background: '#b590ff7c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '50px',
                        height: '50px',
                        zIndex: 1000,
                        width: '50%',
                        borderRadius: '35px',
                        marginTop: '15px',
                    }} hidden={!isClose}>
                    <h2>{currentTrack ? currentTrack.title + ' - ' : 'ничего не играет'}{currentTrack ? currentTrack.artist : ''}</h2>
                    <button onClick={togglePlayPause} hidden={!currentTrack}>
                        {isPlaying ? '⏸' : '▶'}
                    </button>
                    <audio ref={audioRef} />
                    <button onClick={closePanel}>X</button>
                </div>
            </>
        )
    }
}

export default Player