import "./globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import { ClientAuthProvider } from '../components/ClientAuthProvider'

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
      <body className={inter.className}>
        <ClientAuthProvider>{children}</ClientAuthProvider>
      </body>
    </html>
  )
}