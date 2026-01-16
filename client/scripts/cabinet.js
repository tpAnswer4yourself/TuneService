document.addEventListener('DOMContentLoaded', () => {
    const block_user_info = document.getElementById('user-data')
    function checkTokenInLS() {
        if (localStorage.getItem('token') === null) {
            window.location.href = 'auth.html'
            console.log("токена нет, отправляем на авторизацию")
            return false
        }
        else {
            console.log("токен есть, выполняем GET на API")
            return true
        }
    }

    if (checkTokenInLS() === true) {
        const token_storage = localStorage.getItem('token')
        fetch(`${URL_BASE_API}users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token_storage}`
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token')
                    window.location.href = 'auth.html'
                }
                else {
                    throw new Error('Ошибка сервера')
                }
            }
            return response.json()
        })
        .then (data => {
            block_user_info.innerHTML = `
                Привет, ${data.username}!
            `
        })
        .catch (errorrr => {
            console.error(errorrr)
        })
    }
    
})