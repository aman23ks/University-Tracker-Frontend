// File: /app/layout.tsx
import "./globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import { ClientAuthProvider } from '@/components/ClientAuthProvider'
// import { SubscriptionProvider } from '@/components/providers/SubscriptionProvider'
import Script from 'next/script'
import { ClientSubscriptionProvider } from "@/components/providers/ClientSubscriptionProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "University Data Platform",
  description: "Manage and explore university data",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ClientAuthProvider>
          <ClientSubscriptionProvider>
            {children}
          </ClientSubscriptionProvider>
        </ClientAuthProvider>
      </body>
    </html>
  )
}