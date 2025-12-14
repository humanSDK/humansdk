import { Hero } from "../components/hero"
import { Features } from "../components/features"
import { Pricing } from "../components/pricing"
import { ContactForm } from "../components/contact-form"
import { Footer } from "../components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Hero />
      <Features />
      <Pricing />
      <ContactForm />
      <Footer />
    </main>
  )
}

