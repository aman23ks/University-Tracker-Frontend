// app/page.tsx
import { ArrowRight, Check, Play, BookOpen, Globe, Shield, Clock, Search, FileSpreadsheet } from "lucide-react"
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
              <span className="bg-gray-100 text-gray-800 text-sm font-medium py-1 px-3 rounded-full inline-block mb-4">Graduate School Made Simple</span>
              <h1 className="text-5xl font-bold text-[#111827] mb-6 leading-tight">
                Research Grad Schools in Minutes, Not Hours
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Compare universities, track deadlines, and make confident decisions with our intuitive platform built specifically for graduate applicants.
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
              src="https://drive.google.com/file/d/11RB60VZTOIBClr4xXEBFX5VEuhX0VBkU/preview"
              allowFullScreen
              style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}
            ></iframe>
          </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#111827] mb-3">How Admit Bridge Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Our streamlined process helps you research and compare universities effortlessly</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Search className="h-8 w-8 text-[#111827]" />,
                title: "Select Universities",
                description: "Choose from our comprehensive database of universities with detailed program information",
              },
              {
                icon: <Globe className="h-8 w-8 text-[#111827]" />,
                title: "Compare Data",
                description: "View admission requirements, tuition costs, and program details side by side",
              },
              {
                icon: <BookOpen className="h-8 w-8 text-[#111827]" />,
                title: "Customize & Organize",
                description: "Save your research and add custom notes to better organize your applications",
              },
            ].map((step, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-14 w-14 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#111827] mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#111827] mb-3">Why Students Choose Admit Bridge</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">We're dedicated to making your grad school search process more efficient</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: <Clock className="h-6 w-6 text-[#111827]" />,
                title: "3x Faster Research",
                description: "Compare multiple universities side-by-side instantly",
              },
              {
                icon: <Shield className="h-6 w-6 text-[#111827]" />,
                title: "Data You Can Trust",
                description: "Real-time verified information from official sources",
              },
              {
                icon: <BookOpen className="h-6 w-6 text-[#111827]" />,
                title: "Easy Organization",
                description: "Track everything in one beautiful interface",
              },
              {
                icon: <Check className="h-6 w-6 text-[#111827]" />,
                title: "Customizable Views",
                description: "Organize information based on what matters most to you",
              },
            ].map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#111827] mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Subscription - Commented out */}
      {/* <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#111827] mb-3">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Choose the plan that works for your needs</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Free",
                price: "₹0",
                description: "Perfect for getting started",
                features: [
                  "Compare 3 universities",
                  "Basic analytics",
                  "Community support",
                ],
              },
              {
                title: "Premium",
                price: "₹299",
                period: "/month",
                description: "For serious applicants",
                features: [
                  "Unlimited comparisons",
                  "Advanced insights",
                  "Priority support",
                  "Custom parameters",
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
      </section> */}

      {/* Testimonials */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#111827] mb-3">What Our Users Say</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Join thousands of students who've simplified their grad school search</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Admit Bridge saved me countless hours of research. I was able to find the perfect program in just one afternoon!",
                name: "Sarah J.",
                program: "Computer Science MS Applicant"
              },
              {
                quote: "The comparison tool made it so easy to see which universities matched my requirements. Highly recommend to any grad school applicant.",
                name: "Michael T.",
                program: "Computer Science MS Applicant"
              },
              {
                quote: "I was overwhelmed by all the options until I found Admit Bridge. Now I feel confident in my application choices.",
                name: "Priya M.",
                program: "Computer Science MS Applicant"
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex flex-col h-full">
                  <div className="mb-4 text-yellow-400 flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-6 flex-grow">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-[#111827]">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.program}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-[#111827] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to simplify your grad school search?</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">Join thousands of students who are making smarter, faster decisions about their graduate education.</p>
          <Link href="/auth/register">
            <Button className="bg-white text-[#111827] hover:bg-gray-100 h-12 px-8">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-gray-400">No credit card required. Start comparing universities in minutes.</p>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-xl font-bold text-[#111827]">Admit Bridge</span>
              <p className="text-sm text-gray-600 mt-1">Simplifying graduate school research</p>
            </div>
            <div className="flex space-x-8">
              <Link href="#" className="text-sm text-gray-600 hover:text-[#111827]">
                About
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-[#111827]">
                Contact
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-[#111827]">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-[#111827]">
                Terms
              </Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100 text-center md:text-left">
            <span className="text-sm text-gray-600">&copy; 2025 Admit Bridge. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}