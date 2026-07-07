import { useState } from 'react'
import { content } from './content.js'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Generator from './components/Generator.jsx'
import ProblemFraming from './components/ProblemFraming.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import Portfolio from './components/Portfolio.jsx'
import Pricing from './components/Pricing.jsx'
import Testimonials from './components/Testimonials.jsx'
import FAQ from './components/FAQ.jsx'
import BriefForm from './components/BriefForm.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  // Default 'b2b' sesuai rekomendasi PRD (segmen paling aman untuk divalidasi dulu).
  const [audience, setAudience] = useState('b2b')
  const c = content[audience]

  return (
    <div>
      <Nav audience={audience} setAudience={setAudience} />
      <main>
        <Hero audience={audience} setAudience={setAudience} data={c.hero} />
        <Generator key={`gen-${audience}`} audience={audience} />
        {/* key={audience} memaksa remount section berbasis copy saat toggle,
            supaya state lokal (mis. FAQ accordion) ikut reset & animasi fresh. */}
        <ProblemFraming key={`prob-${audience}`} data={c.problems} />
        <HowItWorks key={`how-${audience}`} data={c.steps} />
        <Portfolio />
        <Pricing key={`price-${audience}`} data={c.packages} />
        <Testimonials key={`test-${audience}`} data={c.testimonials} />
        <FAQ key={`faq-${audience}`} data={c.faq} />
        <BriefForm audience={audience} data={c.form} />
      </main>
      <Footer />
    </div>
  )
}
