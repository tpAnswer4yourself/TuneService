import { useState, useRef, createContext } from "react"

const PlayerContext = createContext()

function PlayerProvider({ children }) {
    const [currentTrack, setCurrentTrack] = useState(null) //тело трека
    const [isPlaying, setIsPlaying] = useState(false) //играет/не играет
    const audioRef = useRef(null) //управление аудио
    const [volume, setVolume] = useState(1.0)

    const playTrack = (track) => {
        console.log('PLAYERCONTEXT: playTrack')
        setCurrentTrack(track)
        setIsPlaying(true)
    }

    const togglePlayPause = () => {
        console.log('PLAYERCONTEXT: togglePlayPause')
        setIsPlaying(!isPlaying)
    }

    const changeVolume = (vol) => {
        if (vol > 1 && vol < 0) {
            return
        }
        else {
            setVolume(vol)
            if (audioRef.current) {
                audioRef.current.volume = volume
            }
        }
    }

    return (
        <PlayerContext.Provider value={{ currentTrack, isPlaying, playTrack, togglePlayPause, audioRef, setCurrentTrack, setIsPlaying, changeVolume, volume }}>
            {children}
        </PlayerContext.Provider>
    )

}

export { PlayerContext, PlayerProvider }