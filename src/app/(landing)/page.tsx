"use client"

import type React from "react"

import { useUser, SignInButton } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Leaf } from "lucide-react"

export default function LandingPage() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  type Bubble = {
    size: string
    distance: string
    position: string
    time: string
    delay: string
  }
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [mounted, setMounted] = useState(false)

  // Redirect signed-in users to /home
  useEffect(() => {
    if (isSignedIn) {
      router.push("/home")
    }
  }, [isSignedIn, router])

  // Generate bubbles only on client side to avoid hydration issues
  useEffect(() => {
    setMounted(true)
    setBubbles(
      Array.from({ length: 15 }).map(() => ({
        size: `${2 + Math.random() * 4}rem`,
        distance: `${6 + Math.random() * 4}rem`,
        position: `${-5 + Math.random() * 110}%`,
        time: `${2 + Math.random() * 2}s`,
        delay: `${-1 * (2 + Math.random() * 2)}s`,
      }))
    )
  }, [])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#015958] to-[#023535]">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <div className="bubbles">
          {mounted && bubbles.map((bubble, i) => (
            <div
              key={i}
              className="bubble"
              style={{
                "--size": bubble.size,
                "--distance": bubble.distance,
                "--position": bubble.position,
                "--time": bubble.time,
                "--delay": bubble.delay,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="z-10 flex flex-col items-center justify-center space-y-8 px-4 text-center">
        <div className="flex items-center space-x-2">
          <Leaf className="h-12 w-12 text-[#C7FFED]" />
          <h1 className="text-6xl font-extrabold tracking-tight">
            <span className="text-[#C7FFED]">Nutri</span>
            <span className="text-white">Bot</span>
          </h1>
        </div>

        <div className="max-w-md space-y-4">
          <p className="text-xl text-[#D8FFDB]">Your personalized nutrition assistant powered by AI</p>
          <p className="text-[#D8FFDB]/80">
            Get tailored nutrition advice, meal plans, and health insights based on your personal profile
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center space-y-4">
          <SignInButton>
            <button className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-[#008F8C] px-8 py-3 font-medium text-white transition-all hover:bg-[#008F8C]/90">
              <span className="relative z-10">Get Started</span>
              <span className="absolute inset-0 -translate-y-full rounded-full bg-[#015958] transition-transform duration-300 ease-out group-hover:translate-y-0"></span>
            </button>
          </SignInButton>

          <p className="text-sm text-[#D8FFDB]/60">Your journey to better nutrition starts here</p>
        </div>

        <div className="mt-12 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              title: "Personalized Advice",
              description: "Get nutrition recommendations tailored to your unique profile",
            },
            {
              title: "AI-Powered Insights",
              description: "Advanced algorithms analyze your health data for optimal results",
            },
            { title: "Track Your Progress", description: "Monitor your nutrition journey with detailed analytics" },
          ].map((feature, index) => (
            <div key={index} className="rounded-xl border border-[#008F8C]/20 bg-[#023535]/50 p-6 backdrop-blur-sm">
              <h3 className="mb-2 text-lg font-medium text-[#C7FFED]">{feature.title}</h3>
              <p className="text-sm text-[#D8FFDB]/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add custom styles for the animated background */}
      <style jsx>{`
        .bubbles {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .bubble {
          position: absolute;
          left: var(--position);
          bottom: -10rem;
          display: block;
          width: var(--size);
          height: var(--size);
          border-radius: 50%;
          background: radial-gradient(circle at center, rgba(199, 255, 237, 0.1) 0%, rgba(199, 255, 237, 0.05) 50%, rgba(199, 255, 237, 0) 70%);
          animation: float var(--time) var(--delay) infinite ease-in;
        }
        
        @keyframes float {
          0% {
            bottom: -10rem;
            opacity: 0;
          }
          50% {
            opacity: 0.8;
            transform: translateX(0);
          }
          100% {
            bottom: calc(100% + var(--size));
            opacity: 0;
            transform: translateX(calc(var(--distance) * (var(--position) < 50 ? 1 : -1)));
          }
        }
      `}</style>
    </div>
  )
}