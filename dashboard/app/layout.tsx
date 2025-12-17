import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { LayoutClient } from "@/components/layout-client"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
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
    <html lang="en" className={`${poppins.variable} dark`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  )
}
