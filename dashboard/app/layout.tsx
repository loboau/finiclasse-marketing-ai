import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Finiclasse Marketing Dashboard",
  description: "Marketing and content creation dashboard for Mercedes-Benz Finiclasse dealership",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
