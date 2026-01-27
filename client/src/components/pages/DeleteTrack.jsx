export default async function DeleteTrack(track_id) {
    try {
        const response = await fetch(`http://localhost:8000/tracks/delete/${track_id}`, {
            method: 'DELETE'
        })

        if (response.status === 401) {
            console.log('Ошибка 401!')
        }
        else if (!response.ok) {
            const err = await response.json()
            throw new Error(err.detail)
        }
        return
    }
    catch (err) {
        console.log('Ошибка при удалении: ', err)
        throw err
    }
}
