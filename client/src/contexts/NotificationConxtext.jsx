import { createContext, useState } from "react"

const NotificationContext = createContext()

function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]) //массив уведомлений

    const showNotification = (message, type = 'info', duration = 5000) => {
        const id = Date.now().toString() + Math.random()
        setNotifications(prev => [...prev, { id, message, type }])

        setTimeout(() => {
            removeNotification(id)
        }, duration)
    }

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    return (
        <NotificationContext.Provider value={{
            notifications, showNotification, removeNotification
        }}>
            {children}
        </NotificationContext.Provider>
    )
}

export { NotificationContext, NotificationProvider }

