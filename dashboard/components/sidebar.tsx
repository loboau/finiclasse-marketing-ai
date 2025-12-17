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
} from "lucide-react"

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

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-midnight text-white">
      {/* Header with Mercedes Logo */}
      <div className="flex h-20 items-center justify-center gap-3 border-b border-graphite px-4">
        <Image
          src="/mercedes-logo.png"
          alt="Mercedes-Benz"
          width={42}
          height={42}
          className="h-[42px] w-[42px] object-contain"
        />
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-white">Finiclasse</span>
          <span className="text-[10px] text-amg font-medium tracking-wider">MERCEDES-BENZ</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-amg text-white shadow-lg shadow-amg/20"
                  : "text-arrow hover:bg-graphite hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-white" : "text-arrow group-hover:text-white"
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer with Finiclasse branding */}
      <div className="border-t border-graphite p-4">
        <div className="flex items-center gap-3 rounded-lg bg-graphite/50 px-3 py-2">
          <Image
            src="/finiclasse-logo.png"
            alt="Finiclasse"
            width={32}
            height={32}
            className="h-8 w-8 object-contain rounded"
          />
          <div className="flex-1 text-sm">
            <p className="font-medium">Finiclasse</p>
            <p className="text-[10px] text-arrow">Viseu &bull; Guarda</p>
          </div>
        </div>
      </div>
    </div>
  )
}
