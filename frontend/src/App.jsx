// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Result from './pages/Result'
import CareerReport from './pages/CareerReport'
import Disclaimer from './pages/Disclaimer'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/generate" element={<Home />} />
        <Route path="/kundli" element={<Result />} />
        <Route path="/career-report" element={<CareerReport />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
      </Routes>
    </BrowserRouter>
  )
}
