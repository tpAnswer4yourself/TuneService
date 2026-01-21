import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function UploadTrack() {
    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [artist, setArtist] = useState('')
    const [file, setFile] = useState(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            console.log('Файлик загружается в юзСтейт')
            setFile(selectedFile)
        }
    }

    const SubmitUploadTrack = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        console.log('Проверка полей...')
        if (!title.trim() || !artist.trim() || !file) {
            setError('Заполните все поля!!!')
            alert('Заполните все поля!!!')
            return
        }
        console.log('Проверка пройдена!')
        setIsLoading(true)
        const formdata = new FormData()
        formdata.append('title', title)
        formdata.append('artist', artist)
        formdata.append('file', file)
        try {
            const response = await fetch(`http://localhost:8000/tracks/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formdata
            })
            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.detail || 'Ошибка загрузки')
            }
            setSuccess('Трек успешно загружен!')
            setArtist('')
            setTitle('')
            setFile(null)
        }
        catch (err) {
            setError(err.message)
        }
        finally {
            setIsLoading(false)
        }
    }



    return (
        <>
            <h1>Загрузка треков</h1>
            <form action="" method="post" onSubmit={SubmitUploadTrack}>
                <input
                    type="text"
                    placeholder='Название трека'
                    name='title'
                    id='title'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder='Имя исполнителя'
                    name='artist'
                    id='artist'
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    required
                />
                <input
                    type="file"
                    placeholder='Загрузить файл'
                    name='file_path'
                    id='file_path'
                    accept='audio/*'
                    onChange={handleFileChange}
                    required
                />
                {error && <div style={{ color: 'red' }}>{error}</div>}
                {success && <div style={{ color: 'green' }}>{success}</div>}
                <button type="submit" disabled={isLoading} style={{ background: 'yellow' }}>
                    {isLoading ? 'Загрузка...' : 'Загрузить'}
                </button>
            </form>
            <button onClick={() => { navigate('/dashboard') }}>Вернуться в личный кабинет</button>
        </>
    )
}

export default UploadTrack