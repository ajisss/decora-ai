import { content } from '../content.js'
import Nav from '../components/Nav.jsx'
import Hero from '../components/Hero.jsx'
import GeneratorTeaser from '../components/GeneratorTeaser.jsx'
import ProblemFraming from '../components/ProblemFraming.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import Portfolio from '../components/Portfolio.jsx'
import Pricing from '../components/Pricing.jsx'
import Testimonials from '../components/Testimonials.jsx'
import FAQ from '../components/FAQ.jsx'
import BriefForm from '../components/BriefForm.jsx'
import Footer from '../components/Footer.jsx'

export default function LandingPage() {
  return (
    <div>
      <Nav />
      <main>
        <Hero data={content.hero} />
        <GeneratorTeaser />
        <ProblemFraming data={content.problems} />
        <HowItWorks data={content.howItWorks} />
        <Portfolio />
        <Pricing data={content.packages} />
        <Testimonials data={content.testimonials} />
        <FAQ data={content.faq} />
        <BriefForm data={content.form} />
      </main>
      <Footer />
    </div>
  )
}
