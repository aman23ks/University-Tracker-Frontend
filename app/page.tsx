// app/page.tsx
import { ArrowRight, Check, Play } from "lucide-react"
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <span className="text-2xl font-bold text-[#111827]">Admit Bridge</span>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline" className="hover:bg-gray-50">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-[#111827] hover:bg-gray-800">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h1 className="text-5xl font-bold text-[#111827] mb-6 leading-tight">
                Research Grad Schools in Minutes, Not Hours
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Compare universities, track deadlines, and make confident decisions with our intuitive platform.
              </p>
              <div className="flex items-center gap-4 mb-8">
                <Link href="/auth/register">
                  <Button className="bg-[#111827] hover:bg-gray-800 h-12 px-6">
                    Try Free Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <div className="text-sm text-gray-500">
                  ✨ No credit card required
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white" />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Trusted by <span className="font-semibold">2,000+</span> grad school applicants
                </p>
              </div>
            </div>
            
            {/* Video Player */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-2xl" style={{paddingBottom: "56.25%", height: 0}}>
              <iframe
                src="https://www.loom.com/embed/774a107d38784075a19b4d0cd0d7a5c8?sid=2da12c2e-0a12-4a3e-abb1-c7bce9850811"
                allowFullScreen
                style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "3x Faster Research",
                description: "Compare multiple universities side-by-side instantly",
              },
              {
                title: "Data You Can Trust",
                description: "Real-time verified information from official sources",
              },
              {
                title: "Easy Organization",
                description: "Track everything in one beautiful interface",
              },
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="h-8 w-8 rounded-full bg-[#111827] text-white flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#111827] mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Free",
                price: "₹0",
                description: "Perfect for getting started",
                features: [
                  "Compare 3 universities",
                  "Basic analytics",
                  // "CSV exports",
                ],
              },
              {
                title: "Premium",
                price: "299",
                period: "/month",
                description: "For serious applicants",
                features: [
                  "Unlimited comparisons",
                  "Advanced insights",
                  "Priority support",
                ],
                featured: true
              },
            ].map((plan, index) => (
              <div key={index} 
                className={`rounded-xl p-6 ${
                  plan.featured 
                    ? 'bg-[#111827] text-white ring-2 ring-[#111827]' 
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-1">{plan.title}</h3>
                  <p className={plan.featured ? 'text-gray-300' : 'text-gray-600'}>
                    {plan.description}
                  </p>
                </div>
                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className={`ml-1 ${plan.featured ? 'text-gray-300' : 'text-gray-600'}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className={`h-5 w-5 mr-2 ${
                        plan.featured ? 'text-gray-300' : 'text-[#111827]'
                      }`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={index === 0 ? "/auth/register" : "/pricing"}>
                  <Button 
                    className={`w-full ${
                      plan.featured
                        ? 'bg-white text-[#111827] hover:bg-gray-100'
                        : 'bg-[#111827] text-white hover:bg-gray-800'
                    }`}
                  >
                    {index === 0 ? "Get Started" : "Upgrade Now"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-[#111827] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to simplify your grad school search?</h2>
          <Link href="/auth/register">
            <Button className="bg-white text-[#111827] hover:bg-gray-100 h-12 px-8">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <span className="text-sm text-gray-600">&copy; 2025 Admit Bridge</span>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-[#111827]">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-[#111827]">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}