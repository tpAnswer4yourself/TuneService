import { useContext } from "react"
import { NotificationContext } from "../contexts/NotificationConxtext"

export const UseNotification = () => {
    const { showNotification } = useContext(NotificationContext)

    return {
        success: (msg, duration) => showNotification(msg, 'success', duration),
        error: (msg, duration) => showNotification(msg, 'error', duration),
        info: (msg, duration) => showNotification(msg, 'info', duration),
        warning: (msg, duration) => showNotification(msg, 'warning', duration)
    }
}