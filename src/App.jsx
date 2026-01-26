import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Programs from './components/Programs'
import Team from './components/Team'
import TeamMember from './components/TeamMember'
import Contact from './components/Contact'

// Home page component
function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Programs />
    </>
  )
}

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/team" element={<Team />} />
        <Route path="/team/:memberId" element={<TeamMember />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  )
}

export default App
