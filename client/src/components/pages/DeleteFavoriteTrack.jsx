export default async function DeleteFavoriteTrack(track_id) {
    try {
        const response = await fetch(`http://localhost:8000/favorite/delete/${track_id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
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
        console.log('Ошибка: ', err)
        throw err
    }
}