import { useState, useRef, createContext } from "react"

const PlayerContext = createContext()

function PlayerProvider({ children }) {
    const [currentTrack, setCurrentTrack] = useState(null) //тело трека
    const [isPlaying, setIsPlaying] = useState(false) //играет/не играет
    const audioRef = useRef(new Audio()) //управление аудио

    const playTrack = (track) => {
        console.log('PLAYERCONTEXT: playTrack')
        setCurrentTrack(track)
        setIsPlaying(true)
    }

    const togglePlayPause = () => {
        console.log('PLAYERCONTEXT: togglePlayPause')
        setIsPlaying(!isPlaying)
    }

    return (
        <PlayerContext.Provider value={{ currentTrack, isPlaying, playTrack, togglePlayPause, audioRef, setCurrentTrack, setIsPlaying }}>
            {children}
        </PlayerContext.Provider>
    )

}

export { PlayerContext, PlayerProvider }