import { useContext } from "react"
import { PlayerContext } from "../context/PlayerContext"

function Track({ track }) {
    const { currentTrack, playTrack, isPlaying, togglePlayPause } = useContext(PlayerContext)

    const playbutton = (e) => {
        togglePlayPause()
        if (track.id !== currentTrack) {
            playTrack(track)
        }
    }

    return <>
        <div className="track-card" style={{ background: '#e4ddef', padding: '20px', margin: '20px', borderRadius: '30px' }}>
            <h3>{track.title} - {track.artist}</h3>
            <p>Загружен: {new Date(track.created_at).toLocaleDateString()}</p>
            <p>ID: {track.id}</p>
            <audio key={track.id} controls>
                <source src={`http://localhost:8000/tracks/stream/${track.id}`} type="audio/mpeg" />
                Браузер не поддерживает аудио
            </audio>
            <button
                onClick={() => { playbutton() }}>▶
            </button>
        </div>
    </>
}

export default Track