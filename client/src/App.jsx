import { useState } from 'react'
import './App.css'
import AppRoutes from './AppRoutes'
import Player from './components/Player/Player'
import Notifications from './components/Notification/Notifications'

function App() {
  return (
    <>
      <AppRoutes />
      <Player />
      <Notifications />
    </>
  )
}

export default App
