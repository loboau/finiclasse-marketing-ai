"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Sidebar } from "@/components/sidebar"

interface LayoutClientProps {
  children: React.ReactNode
}

export function LayoutClient({ children }: LayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="flex-1 overflow-y-auto bg-background">
        {/* Mobile header with hamburger button */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/10 bg-midnight px-4 md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-graphite transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-gray-300" />
          </button>
          <h1 className="text-lg font-semibold text-white">Finiclasse</h1>
        </div>

        {/* Main content */}
        <div className="container mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
