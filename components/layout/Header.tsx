// components/Header.tsx
"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navItems = [
  { name: "Resume", href: "/dashboard" },
  { name: "Questionnaire", href: "/questionnaire" },
  { name: "ATS Checker", href: "/atschecker" },
];

const Header = () => {
  const user = useUser();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md">
      <nav className="backdrop-blur-md px-6 py-2.5">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <Link href="/" className="flex items-center">
            <img src="/icons/logo.svg" className="mr-3 h-7 sm:h-9" alt="logo" />
            <span className="self-center text-xl font-bold whitespace-nowrap">
              ResumeAI
            </span>
          </Link>
          
          {/* Navigation Links */}
          <div className="flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-lg font-medium px-4 py-2 rounded-md transition ${
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Authentication Buttons */}
          <div className="flex items-center lg:order-2">
            {user?.isLoaded && !user?.isSignedIn ? (
              <Link
                href="/sign-in"
                className="text-gray-800 hover:bg-primary-700/10 duration-300 focus:ring-4 focus:ring-primary-700/30 font-medium rounded-full text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none"
              >
                Log in
              </Link>
            ) : (
              <>
                <div className="mr-4 h-full items-center align-middle flex max-md:hidden justify-center">
                  <UserButton showName={true} />
                </div>
                <div className="mr-4 h-full items-center align-middle hidden max-md:flex justify-center">
                  <UserButton showName={false} />
                </div>
              </>
            )}
            <Link
              href={`${!user?.isSignedIn ? "/sign-up" : "/dashboard"}`}
              className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-full text-sm px-4 lg:px-5 py-2 lg:py-2.5 focus:outline-none"
            >
              {!user?.isSignedIn ? "Get started" : "Dashboard"}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;