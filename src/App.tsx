import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/global.scss'
import './App.scss'
import LandingPage from './components/LandingPage'
import Profile from './components/Profile'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App