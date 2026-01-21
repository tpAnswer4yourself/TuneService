import { useState } from 'react'
import './App.css'
import AppRoutes from './AppRoutes'
import Player from './components/Player'

function App() {
  return (
    <>
      <AppRoutes />
      <Player />
    </>
  )
}

export default App
