import { useState, useEffect, useRef, createContext } from "react"

const PlayerContext = createContext()

function PlayerProvider({ children }) {
    const [currentTrack, setCurrentTrack] = useState(null) //тело трека
    const [isPlaying, setIsPlaying] = useState(false) //играет/не играет
    const audioRef = useRef(null) //управление аудио

    const playTrack = (track) => {
        setCurrentTrack(track)
        setIsPlaying(true)
    }

    const togglePlayPause = () => {
        console.log('Поменяли воспроизведение')
        setIsPlaying(!isPlaying)
    }
    /*
        //смена текущего трека
        useEffect(() => {
            console.log("useEffect сработал. currentTrack:", currentTrack?.title, "isPlaying:", isPlaying)
            if (currentTrack && audioRef.current) {
                console.log("Устанавливаем src:", `http://localhost:8000/tracks/stream/${currentTrack.id}`)
                audioRef.current.src = `http://localhost:8000/tracks/stream/${currentTrack.id}`
                audioRef.current.load()
                if (isPlaying) {
                    console.log("Пытаемся играть...")
                    audioRef.current.play().catch(e => {
                        console.log('Воспроизводим трек', e.name, e.message)
                        setIsPlaying(false)
                    })
                }
            }
        }, [currentTrack, isPlaying])*/

    return (
        <PlayerContext.Provider value={{ currentTrack, isPlaying, playTrack, togglePlayPause }}>
            {children}
        </PlayerContext.Provider>
    )

}

export { PlayerContext, PlayerProvider }