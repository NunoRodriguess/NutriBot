"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { Leaf, Menu, X } from 'lucide-react'
import { useState } from "react"

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-[#008F8C]/20 bg-[#012020] shadow-md">
      <div className="mx-auto flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo - positioned on the left edge */}
        <Link href="/home" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#008F8C]/20 p-2">
            <Leaf className="h-6 w-6 text-[#C7FFED]" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-[#C7FFED]">Nutri</span>
            <span className="text-white">Bot</span>
          </span>
        </Link>

        {/* Desktop Navigation - centered */}
        <div className="hidden md:block">
          <SignedIn>
            <div className="flex items-center space-x-1">
              <NavLink href="/home" active={isActive("/home")}>
                Dashboard
              </NavLink>
              <NavLink href="/profile" active={isActive("/profile")}>
                Profile
              </NavLink>
            </div>
          </SignedIn>
        </div>

        {/* Sign In/User Button - positioned on the right edge */}
        <div>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-9 h-9",
                },
              }}
            />
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <button className="group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-lg bg-[#008F8C] px-6 py-2 font-medium text-white transition-all hover:bg-[#008F8C]/90">
                <span className="relative z-10">Sign In</span>
                <span className="absolute inset-0 -translate-y-full rounded-lg bg-[#015958] transition-transform duration-300 ease-out group-hover:translate-y-0"></span>
              </button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Mobile menu button */}
        <div className="ml-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-[#C7FFED] hover:bg-[#015958] hover:text-white"
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="space-y-1 bg-[#012020] px-2 pb-3 pt-2 md:hidden">
          <SignedIn>
            <NavLink href="/home" active={isActive("/home")} mobile>
              Dashboard
            </NavLink>
            <NavLink href="/profile" active={isActive("/profile")} mobile>
              Profile
            </NavLink>
            <div className="mt-4 flex items-center justify-between border-t border-[#008F8C]/20 pt-4">
              <span className="text-sm text-[#D8FFDB]/70">Your Account</span>
              <UserButton />
            </div>
          </SignedIn>
          <SignedOut>
            <div className="py-2">
              <SignInButton>
                <button className="w-full rounded-lg bg-[#008F8C] px-4 py-2 text-center font-medium text-white">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </SignedOut>
        </div>
      )}
    </nav>
  )
}

interface NavLinkProps {
  href: string
  active: boolean
  children: React.ReactNode
  mobile?: boolean
}

function NavLink({ href, active, children, mobile = false }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`${mobile ? "block" : "inline-block"} rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-[#008F8C]/20 text-[#C7FFED]" : "text-[#D8FFDB]/80 hover:bg-[#015958]/30 hover:text-[#C7FFED]"
      }`}
    >
      {children}
    </Link>
  )
}
