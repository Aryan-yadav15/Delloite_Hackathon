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
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">MailMesh</span>
            </Link>
          </div>

          <div className="flex items-center">
            {!isLoaded ? null : user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  {user.fullName}
                </span>
                <UserButton afterSignOutUrl="/"/>
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