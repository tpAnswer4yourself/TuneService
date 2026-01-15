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
    })

    form_reg.addEventListener('submit', function(event) {
        event.preventDefault()
        console.log("form-reg форма обрабатывается")
    })
})