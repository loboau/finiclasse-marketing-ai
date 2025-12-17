"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Calendar,
  BookOpen,
  Megaphone,
  ImageIcon,
  Bot,
  Palette,
  X,
} from "lucide-react"
import { useEffect } from "react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Fini Assistant",
    href: "/fini-assistant",
    icon: Bot,
  },
  {
    name: "Copy Generator",
    href: "/copy-generator",
    icon: FileText,
  },
  {
    name: "Template Editor",
    href: "/editor",
    icon: Palette,
  },
  {
    name: "Editorial Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    name: "Mercedes Knowledge",
    href: "/knowledge",
    icon: BookOpen,
  },
  {
    name: "Campaign Library",
    href: "/campaigns",
    icon: Megaphone,
  },
  {
    name: "Media Assets",
    href: "/assets",
    icon: ImageIcon,
  },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()

  // Close mobile menu on route change
  useEffect(() => {
    if (isOpen && onClose) {
      onClose()
    }
  }, [pathname])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 h-screen w-64 flex-col bg-midnight text-white flex-shrink-0 transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0 flex" : "-translate-x-full md:flex"
        )}
      >
        {/* Mobile close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-4 p-2 rounded-lg hover:bg-graphite transition-colors md:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5 text-gray-300" />
        </button>

        {/* Header with Mercedes Logo */}
        <div className="flex h-20 items-center justify-center gap-3 border-b border-white/10 px-4">
        <Image
          src="/mercedes-logo.png"
          alt="Mercedes-Benz"
          width={42}
          height={42}
          className="h-[42px] w-[42px] object-contain"
        />
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-white">Finiclasse</span>
          <span className="text-[10px] text-amg font-medium tracking-wider uppercase">Mercedes-Benz</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-amg text-white shadow-lg shadow-amg/20"
                  : "text-gray-300 hover:bg-graphite hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200",
                  isActive ? "text-white" : "text-gray-300 group-hover:text-white"
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>

        {/* Footer with Finiclasse branding */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-graphite/50 px-3 py-2.5">
            <Image
              src="/finiclasse-logo.png"
              alt="Finiclasse"
              width={32}
              height={32}
              className="h-8 w-8 object-contain rounded flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">Finiclasse</p>
              <p className="text-[10px] text-gray-300">Viseu &bull; Guarda</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
