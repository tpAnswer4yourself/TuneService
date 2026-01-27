import { PlayerProvider } from "./PlayerContext"
import { NotificationProvider } from "./NotificationConxtext"
import { AuthProvider } from "./AuthContext"

export const AllProviders = ({ children }) => {
    return (
        <AuthProvider>
            <NotificationProvider>
                <PlayerProvider>
                    {children}
                </PlayerProvider>
            </NotificationProvider>
        </AuthProvider>
    )
}