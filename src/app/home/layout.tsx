"use client";
import "~/styles/globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from "@clerk/nextjs";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          {/* Navbar */}
          <nav className="w-full bg-gray-950 text-white px-6 py-4 flex items-center justify-between shadow-lg">
            {/* Logo */}
            <Link href="/home" className="text-2xl font-bold tracking-wide">
              <span className="text-green-400">Nutri</span>Bot
            </Link>
            {/* Authentication */}
            <div className="flex items-center">
              <SignedOut>
                <SignInButton>
                  <button className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-4">
                  <Link href="/profile">
                    <button className="px-4 py-2 bg-green-700 rounded-lg hover:bg-green-800 transition">
                      Profile
                    </button>
                  </Link>
                  <UserButton />
                </div>
              </SignedIn>
            </div>
          </nav>

          {/* Page Content */}
          <div className="mx-auto w-full">{children}</div>
        </ClerkProvider>
      </body>
    </html>
  );
}