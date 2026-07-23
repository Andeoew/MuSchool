import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { Features } from '@/components/features'
import { Pricing } from '@/components/pricing'
import { FAQ } from '@/components/faq'
import { CTA } from '@/components/cta'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  )
}
