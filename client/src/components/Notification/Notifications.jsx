import { useContext } from "react"
import { NotificationContext } from "../../contexts/NotificationConxtext"
import styles from "./Notification.module.css";

function Notifications() {
    const { notifications, removeNotification } = useContext(NotificationContext)

    if (notifications.length === 0) {
        return null
    }

    const handleCloseNotification = (id) => {
        removeNotification(id)
    }

    return (
        <>
            <div>
                {notifications.map(notification => (
                    <div key={notification.id} className={styles.notificationContainer}>
                        {notification.message}
                        <button onClick={() => handleCloseNotification(notification.id)} className={styles.CloseBtn}>X</button>
                    </div>
                ))}
            </div>
        </>
    )
}

export default Notifications