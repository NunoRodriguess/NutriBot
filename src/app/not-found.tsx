import Link from "next/link"
import { ArrowLeft, Leaf } from "lucide-react"
import "~/styles/globals.css"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#023535] to-[#015958]">
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-[#008F8C]/20">
          <Leaf className="h-16 w-16 text-[#C7FFED]" />
          <div className="absolute -right-4 -top-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#008F8C] text-xl font-bold text-white">
            404
          </div>
        </div>

        <h1 className="mb-2 text-4xl font-bold text-[#C7FFED]">Page Not Found</h1>
        <p className="mb-8 max-w-md text-[#D8FFDB]/80">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-[#008F8C] px-8 py-3 font-medium text-white transition-all hover:bg-[#008F8C]/90"
          >
            <span className="relative z-10 flex items-center">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Return to Home
            </span>
            <span className="absolute inset-0 -translate-y-full rounded-full bg-[#015958] transition-transform duration-300 ease-out group-hover:translate-y-0"></span>
          </Link>
        </div>
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
  )
}