import { useState, useRef, createContext } from "react"

const PlayerContext = createContext()

function PlayerProvider({ children }) {
    const [currentTrack, setCurrentTrack] = useState(null) //тело DbTrack со всеми свойствами через ?.
    const [isPlaying, setIsPlaying] = useState(false) // состояние: играет/не играет
    const audioRef = useRef(null) //управление аудио
    const [volume, setVolume] = useState(1.0) //громкость трека
    const [currentTime, setCurrentTime] = useState(0) //текущее время
    const [duration, setDuration] = useState(0) //длительность трека
    const [currentIndex, setCurrentIndex] = useState(-1)
    const [queue, setQueue] = useState([])

    const playTrack = (track) => {
        console.log('PLAYERCONTEXT: playTrack')
        setCurrentTrack(track)
        setIsPlaying(true)

        setQueue([track])
        setCurrentIndex(0)
    }

    const addToQueue = (track) => {
        console.log('Добавляем в очередь трек: ', track)
        setQueue(prev => [...prev, track])
        if (queue.length === 1) {
            setCurrentIndex(0)
            setIsPlaying(true)
        }
    }

    const playNext = () => {
        console.log('Играем следующую...')
        if (currentIndex + 1 < queue.length) {
            const newIndex = currentIndex + 1
            setCurrentIndex(newIndex)
            setCurrentTrack(queue[currentIndex])
            setIsPlaying(true)
            console.log('Проверка + 1')
        }
        else {
            console.log('Проверка не прошла!!  null')
            setCurrentTrack(null)
            setIsPlaying(false)
        }
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

    const replayToTime = (time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time
        }
    }

    return (
        <PlayerContext.Provider value={{
            currentTrack, isPlaying, playTrack, togglePlayPause, audioRef,
            setCurrentTrack, setIsPlaying, changeVolume, volume, duration, currentTime, replayToTime,
            setCurrentTime, setDuration, playNext, addToQueue, queue, currentIndex
        }}>
            {children}
        </PlayerContext.Provider>
    )

}

export { PlayerContext, PlayerProvider }