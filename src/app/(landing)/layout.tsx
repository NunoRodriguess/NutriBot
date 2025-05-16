"use client"

import "~/styles/globals.css"
import type React from "react"
import { ClerkProvider } from "@clerk/nextjs"
import Navbar from "~/components/NavBar"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Navbar />
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
}
