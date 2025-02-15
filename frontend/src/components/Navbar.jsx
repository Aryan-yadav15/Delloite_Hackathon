'use client'

import { UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import Link from "next/link"
import { Button } from "./ui/button"

export default function Navbar() {
  const { user, isLoaded } = useUser();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">MailMesh</span>
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/retailers/register"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Retailer Registration
              </Link>
              {user && (
                <Link
                  href="/canvas"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Canvas
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center">
            {!isLoaded ? null : user ? (
              <div className="flex items-center space-x-2">
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonBox: "h-9 w-9",
                      userButtonAvatarBox: "rounded-full border-2 border-gray-200"
                    }
                  }}
                />
              </div>
            ) : (
              <div className="space-x-4">
                <SignInButton mode="modal">
                  <Button variant="ghost">Sign in</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>Register</Button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}