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
            if (data.role === 'admin') {
                block_user_info.innerHTML = `
                    Логин: ${data.username}<br>
                    Фамилия: ${data.full_name || 'Не указана'}<br>
                    Email: ${data.email}<br>
                    Роль: ${data.role || 'Не указана роль'}<br>
                    ID: ${data.id}<br>
                    Вы администратор! Ниже список всех пользователей: ...
                `
            }
            else {
                block_user_info.innerHTML = `
                    Логин: ${data.username}<br>
                    Фамилия: ${data.full_name || 'Не указана'}<br>
                    Email: ${data.email}<br>
                `
            }
           
        })
        .catch (errorrr => {
            console.error(errorrr)
        })
    }

    const logout_btn = document.getElementById("logout-btn")
    const newpassword = document.getElementById("newpass-btn")
    const adminpanel_btn = document.getElementById("admin-panel-btn")

    logout_btn.addEventListener('click', function(event) {
        window.location.href = 'auth.html'
        localStorage.removeItem('token')
        console.log("Вы вышли из аккаунта")
    })

    let ActiveChangeForm = false
    const form_change_password = document.getElementById("change-password-form")
    const div_error = document.getElementById("error-message_ch")

    newpassword.addEventListener('click', function(event) {   
        if (ActiveChangeForm === false) {
            form_change_password.style.display = 'block'
            ActiveChangeForm = true

        }
        else {
            form_change_password.style.display = 'none'
            ActiveChangeForm = false
        }
    })

    form_change_password.addEventListener('submit', function(event) {
        event.preventDefault() // перехват
        div_error.textContent = ""

        const data_passwords = {
            old_password: document.getElementById("old_password").value,
            new_password: document.getElementById("new_password").value,
            new_password_confirm: document.getElementById("new_password_confirm").value
        }
        if (data_passwords.new_password != data_passwords.new_password_confirm) {
            div_error.style.display = 'block'
            div_error.textContent = "Ошибка! Новые пароли не совпадают!"
            alert("Ошибка! Новые пароли не совпадают!")
            return
        }
        if (data_passwords.old_password === data_passwords.new_password) {
            div_error.style.display = 'block'
            div_error.textContent = "Ошибка! Новый пароль не может совпадать со старым!"
            alert("Ошибка! Новый пароль не может совпадать со старым!")
            return
        }
        
        fetch(`${URL_BASE_API}users/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data_passwords)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {throw new Error(err.detail)})
            }
            return response.json()
        })
        .then(data => {
            console.log("Пароль от аккаунта успешно изменен!")
            alert("Пароль от аккаунта успешно изменен!")
            form_change_password.style.display = 'none'
            ActiveChangeForm = false
        })
        .catch(error_r => {
            div_error.style.display = 'block'
            div_error.textContent = error_r.message || "Ошибка! Не удалось сменить пароль!"
        })
    })

    adminpanel_btn.addEventListener('click', function(event) {
        const admin_block = document.getElementById("admin-block-panel")
        admin_block.textContent = ""
        const token_storage = localStorage.getItem('token')
        fetch(`${URL_BASE_API}users/admin-panel`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token_storage}`
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {throw new Error(err.detail)})
            }
            return response.json()
        })
        .then (data => {
            admin_block.innerHTML = `
                Информация: ${data.username}, ${data.role}, ${data.email}!!!
            `   
        })
        .catch (errorrr => {
            admin_block.textContent = errorrr.message || "Ошибка"
            console.error(errorrr)
        })
    }) 
})