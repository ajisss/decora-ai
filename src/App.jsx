import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import StudioPage from './pages/StudioPage.jsx'

export default function App() {
  // Default 'b2b' sesuai rekomendasi PRD (segmen paling aman untuk divalidasi dulu).
  // Diangkat ke sini supaya toggle audience konsisten lintas halaman (landing <-> studio).
  const [audience, setAudience] = useState('b2b')

  return (
    <Routes>
      <Route path="/" element={<LandingPage audience={audience} setAudience={setAudience} />} />
      <Route path="/studio" element={<StudioPage audience={audience} setAudience={setAudience} />} />
    </Routes>
  )
}
