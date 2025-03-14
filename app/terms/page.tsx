// app/terms/page.tsx
import Link from 'next/link'
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <Link href="/">
              <span className="text-2xl font-bold text-[#111827] cursor-pointer">University Search</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" className="hover:bg-gray-50">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Terms Content */}
      <div className="pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto prose prose-slate prose-headings:text-[#111827]">
          <h1>TERMS AND CONDITIONS</h1>
          <p className="text-gray-500"><strong>Last Updated: March 15, 2025</strong></p>

          <h2>1. INTRODUCTION</h2>
          <p>Welcome to University Search's university research platform (the "Service"). These Terms and Conditions ("Terms") govern your access to and use of the Service. Please read these Terms carefully before using our Service.</p>
          <p>By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the Service.</p>

          <h2>2. DEFINITIONS</h2>
          <ul>
            <li><strong>"Company"</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to University Search.</li>
            <li><strong>"Service"</strong> refers to the university research platform.</li>
            <li><strong>"User"</strong> (referred to as either "Users", "You" or "Your") refers to the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service.</li>
            <li><strong>"Content"</strong> refers to data, text, information, and other materials that are available through the Service, including university information, admission requirements, and academic program details.</li>
            <li><strong>"Subscription"</strong> refers to the access to the Service on either a Free Tier or Premium Tier basis.</li>
          </ul>

          <h2>3. ACCOUNTS</h2>
          <h3>3.1 Account Creation</h3>
          <p>When you create an account with us, you must provide accurate, complete, and up-to-date information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.</p>

          <h3>3.2 Account Responsibility</h3>
          <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>

          <h3>3.3 Account Termination</h3>
          <p>We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

          <h2>4. SUBSCRIPTION TIERS AND PAYMENT</h2>
          <h3>4.1 Free Tier</h3>
          <p>The Free Tier allows users to access basic features of the Service with limitations, including a maximum of 3 universities.</p>

          <h3>4.2 Premium Tier</h3>
          <p>The Premium Tier provides unlimited access to all features of the Service for a subscription fee of 1000 rupees per month.</p>

          <h3>4.3 Payment</h3>
          <p>All payments are processed securely through our third-party payment processors. By subscribing to the Premium Tier, you agree to pay the monthly fee. Each payment provides access to Premium features for one month. You will need to manually make a new payment each month to continue accessing Premium features.</p>

          <h3>4.4 Monthly Billing</h3>
          <p>The Premium Tier subscription fee will be billed on a monthly basis. Your subscription will NOT automatically renew. To continue using Premium features, you must manually make a new payment before the end of your current billing cycle.</p>

          <h3>4.5 Subscription Duration and No Refund Policy</h3>
          <p>Once payment is made, you will have access to the Premium Tier for a period of one month. Since there is no automatic renewal, you do not need to cancel your subscription. We currently do not offer refunds for any reason, including for partial month subscriptions or unused periods once payment has been processed.</p>

          <h3>4.6 Price Changes</h3>
          <p>We reserve the right to adjust pricing for our Service or any components thereof in any manner and at any time as we may determine in our sole and absolute discretion. We will provide notice of any price changes by posting the new prices on our website and/or by sending you an email notification.</p>

          <h2>5. SERVICE USAGE AND LIMITATIONS</h2>
          <h3>5.1 University Data</h3>
          <p>The university data provided through the Service is collected from publicly available sources. While we strive to ensure the accuracy and completeness of this data, we cannot guarantee that all information is current or error-free.</p>

          <h3>5.2 User Conduct</h3>
          <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
          <ul>
            <li>Use the Service in any way that violates any applicable law or regulation.</li>
            <li>Attempt to probe, scan, or test the vulnerability of the Service or any associated system or network.</li>
            <li>Interfere with or disrupt the integrity or performance of the Service.</li>
            <li>Attempt to gain unauthorized access to the Service, computer systems, or networks.</li>
            <li>Reproduce, duplicate, copy, sell, resell, or exploit any portion of the Service without express written permission from us.</li>
            <li>Use the Service to collect or harvest any personally identifiable information.</li>
          </ul>

          <h3>5.3 Intellectual Property</h3>
          <p>The Service and its original content, features, and functionality are and will remain the exclusive property of University Search and its licensors. The Service is protected by copyright, trademark, and other laws of both India and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of University Search.</p>

          <h3>5.4 User Content</h3>
          <p>You retain any and all of your rights to any Content you submit, post, or display on or through the Service. By submitting, posting, or displaying Content on or through the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such Content.</p>

          <h2>6. DATA CUSTOMIZATION</h2>
          <h3>6.1 Customization</h3>
          <p>Users may customize their view of university data by adding, removing, or editing columns. Any customization is specific to your account and does not alter the data for other users.</p>

          <h2>7. LIMITATION OF LIABILITY</h2>
          <p>To the maximum extent permitted by applicable law, in no event shall University Search, its affiliates, agents, directors, employees, suppliers, or licensors be liable for any indirect, punitive, incidental, special, consequential, or exemplary damages, including without limitation damages for loss of profits, goodwill, use, data, or other intangible losses, arising out of or relating to the use of, or inability to use, the Service.</p>

          <h2>8. DISCLAIMER</h2>
          <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Company disclaims all warranties of any kind, whether express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement. The Company does not warrant that the Service will function uninterrupted, secure, or available at any particular time or location, or that any errors or defects will be corrected.</p>

          <h2>9. INDEMNIFICATION</h2>
          <p>You agree to defend, indemnify, and hold harmless University Search, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Service.</p>

          <h2>10. GOVERNING LAW</h2>
          <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.</p>

          <h2>11. CHANGES TO TERMS</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.</p>

          <h2>12. SEVERABILITY</h2>
          <p>If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.</p>

          <h2>13. ENTIRE AGREEMENT</h2>
          <p>These Terms constitute the entire agreement between you and University Search regarding our Service, and supersede and replace any prior agreements we might have between us regarding the Service.</p>

          <h2>14. CONTACT US</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <ul>
            <li>Email: legal@universitysearch.com</li>
          </ul>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="py-8 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <span className="text-sm text-gray-600">&copy; 2025 University Search</span>
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