import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { PublicApp } from './components/PublicApp'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PublicApp />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App