"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react"
import { ClerkProvider } from "@clerk/nextjs"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#023535] to-[#015958]">
            <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#008F8C]/20">
                <AlertTriangle className="h-12 w-12 text-[#C7FFED]" />
              </div>

              <h1 className="mb-2 text-4xl font-bold text-[#C7FFED]">Something went wrong</h1>
              <p className="mb-8 max-w-md text-[#D8FFDB]/80">
                We apologize for the inconvenience. A critical error has occurred.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={reset}
                  className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-[#008F8C] px-8 py-3 font-medium text-white transition-all hover:bg-[#008F8C]/90"
                >
                  <span className="relative z-10 flex items-center">
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Try Again
                  </span>
                  <span className="absolute inset-0 -translate-y-full rounded-full bg-[#015958] transition-transform duration-300 ease-out group-hover:translate-y-0"></span>
                </button>

                <Link
                  href="/home"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[#C7FFED]/30 bg-transparent px-8 py-3 font-medium text-[#C7FFED] transition-colors hover:bg-[#008F8C]/10"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Return to Home
                </Link>
              </div>

              {error.digest && <p className="mt-8 text-sm text-[#D8FFDB]/40">Error ID: {error.digest}</p>}
            </div>

            {/* Animated background elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-[#008F8C]/10"
                  style={{
                    width: `${Math.random() * 300 + 50}px`,
                    height: `${Math.random() * 300 + 50}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${Math.random() * 10 + 10}s`,
                    animationDelay: `${Math.random() * 5}s`,
                    animation: "float infinite ease-in-out",
                  }}
                />
              ))}
            </div>
          </div>
        </ClerkProvider>
      </body>
    </html>
  )
}
