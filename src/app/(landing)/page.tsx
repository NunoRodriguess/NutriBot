"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  // Redirect signed-in users to /home
  useEffect(() => {
    if (isSignedIn) {
      router.push("/home");
    }
  }, [isSignedIn, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#1e5106] to-[#152c18] text-white">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-extrabold">
          <span className="text-green-400">Nutri</span>Bot
        </h1>
        <p className="text-lg text-gray-300">
          Your personalized nutrition assistant. Sign in to get started!
        </p>

        <SignInButton>
          <button className="px-6 py-3 bg-green-500 rounded-lg text-lg font-semibold hover:bg-green-600 transition">
            Sign In
          </button>
        </SignInButton>
      </div>
    </div>
  );
}
