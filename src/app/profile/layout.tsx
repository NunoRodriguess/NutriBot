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
    <html lang="en"
      suppressHydrationWarning={true}
     data-lt-installed="true">
      <body>
        <ClerkProvider>
          <Navbar />
          <main>{children}</main>
        </ClerkProvider>
      </body>
    </html>
  )
}
