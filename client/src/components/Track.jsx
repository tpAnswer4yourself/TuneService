import { useContext } from "react"
import { PlayerContext } from "../context/PlayerContext"

function Track({ track }) {
    const { currentTrack, playTrack, isPlaying, togglePlayPause } = useContext(PlayerContext)

    const isCurrentTrack = currentTrack?.id === track.id

    const playbutton = () => {
        if (track.id !== currentTrack?.id) {
            playTrack(track)
            return
        }
        togglePlayPause()
    }

    return <>
        <div className="track-card" style={{ background: '#e4ddef', padding: '20px', margin: '20px', borderRadius: '30px' }}>
            <h3>{track.title} - {track.artist}</h3>
            <p>Загружен: {new Date(track.created_at).toLocaleDateString()}</p>
            <p>ID: {track.id}</p>
            <button
                onClick={() => { playbutton() }}>
                {isCurrentTrack && isPlaying ? '⏸' : '▶'}
            </button>
        </div>
    </>
}

export default Track