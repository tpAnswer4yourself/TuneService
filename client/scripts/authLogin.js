document.addEventListener('DOMContentLoaded', () => {
    console.log("Страница загружена, можно начинать работу")

    const form_login = document.getElementById("login-form")
    const div_login = document.querySelector(".login_div")
    const form_reg = document.getElementById("register-form")
    const div_reg = document.querySelector(".reg_div")

    const switch_to_reg = document.getElementById("switch-to-reg")
    const switch_to_log = document.getElementById("switch-to-log")


    const div_error = document.getElementById("error-message")

    switch_to_reg.addEventListener('click', function(event) {
        console.log("вход -> регистрация")
        div_login.style.display = 'none'
        div_reg.style.display = 'block'
    })

    switch_to_log.addEventListener('click', function(event) {
        console.log("регистрация -> вход")
        div_reg.style.display = 'none'
        div_login.style.display = 'block'
    })

    form_login.addEventListener('submit', function(event) {
        //перехват обработки отправки
        event.preventDefault() //отмена стандартного поведения формы (перезагрузка страницы)
        console.log("form-login форма обрабатывается")

        div_error.textContent = ""

        const Form_Data = new FormData(form_login)
        fetch(`${URL_BASE_API}users/login`, {
            method: 'POST',
            body: Form_Data
        })
        .then(response => {
            if(!response.ok) {
                return response.json().then(err => {throw new Error(err.detail)})
            }
            return response.json()
        })
        .then(data => {
            localStorage.setItem('token', data.access_token)
            window.location.href = 'dashboard.html'
        })
        .catch(errorrr => {
            div_error.textContent = errorrr.message || "Кажется, что-то пошло не так"
            div_error.style.display = 'block'
        })
        console.log("отправка на сервер авторизации")
    })

    form_reg.addEventListener('submit', function(event) {
        event.preventDefault()
        console.log("form-reg форма обрабатывается")
        div_error.textContent = ""
        const password_one = document.getElementById("password_reg").value
        const password_two = document.getElementById("password_confirm_reg").value
        if (password_one !== password_two) {
            console.log("ПАРОЛИ НЕ СОВПАДАЮТ")
            alert("Ошибка! Пароли не совпадают")
            return 
        }
        const data_form_reg = {
            username: document.getElementById("username_reg").value,
            email: document.getElementById("email_reg").value,
            full_name: document.getElementById("full_name_reg").value,
            password_hash: document.getElementById("password_reg").value
        };
        fetch(`${URL_BASE_API}users/registrate`, {
            method: 'POST',
            body: JSON.stringify(data_form_reg),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if(!response.ok) {
                return response.json().then(err => {throw new Error(err.detail)})
            }
            return response.json()
        })
        .then(data => {
            console.log("Пользователь успешно зарегистрирован!")
            window.location.href = 'auth.html'
            div_reg.style.display = 'none'
            div_login.style.display = 'block'

        })
        .catch(errorrr => {
            div_error.textContent = errorrr.message || "Кажется, что-то пошло не так"
            div_error.style.display = 'block'
        })
    })
})