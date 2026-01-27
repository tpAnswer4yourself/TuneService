export default async function AddFavoriteTrack(track_id) {
    try {
        const response = await fetch(`http://localhost:8000/favorite/add`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ track_id: track_id })
        })
        if (response.status === 401) {
            console.log('Ошибка 401!')
        }
        else if (!response.ok) {
            const err = await response.json()
            throw new Error(err.detail)
        }
        return await response.json()
    }

    catch (err) {
        console.log('Ошибка: ', err)
        throw err
    }
}