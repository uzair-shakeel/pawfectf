"use client";
import React, { useState, useEffect } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { BsChatLeftDots } from "react-icons/bs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth/AuthContext";

import Avatar from "../both/Avatar";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const NavbarUpdated = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [chatCount, setChatCount] = useState(0);
  const router = useRouter();
  const { isSignedIn, userId, user } = useAuth(); // Check if the user is signed in

  // Fetch chat count when user is signed in
  useEffect(() => {
    if (!isSignedIn || !userId) return;

    const fetchChats = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/chat/my-chats`,
          {
            headers: {
              "x-clerk-user-id": userId,
            },
          }
        );
        if (!response.ok) {
          console.error("Failed to fetch chats");
          return;
        }
        const data = await response.json();
        // Set the chat count to the number of chats
        setChatCount(data.chats?.length || 0);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };

    fetchChats();
  }, [isSignedIn, userId]);

  const navLinks = [
    { name: "Home", href: "/website" },
    { name: "Blog", href: "/website/blog" },
    { name: "FAQ", href: "/website/faq" },
    { name: "Contact", href: "/website/contact" },
  ];

  // Handler for add listing button
  const handleAddListing = () => {
    if (isSignedIn) {
      router.push("/dashboard/cars/add");
    } else {
      router.push("/sign-in");
    }
  };

  return (
    <header className="w-full p-4 bg-white shadow-md flex justify-between items-center text-black">
      {/* Logo */}
      <div className="">
        <Link href="/website">
          <img src="/whitelogo.png" alt="Ojest Logo" className="h-10" />
        </Link>
      </div>

      <div className="flex items-center space-x-5 sm:mx-4">
        {/* Add Listing Button */}
        <button
          onClick={handleAddListing}
          className="hidden md:block bg-white border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-100"
        >
{isSignedIn ? "Dodaj ogłoszenie" : "Zostań sprzedawcą"}
</button>

        {/* Messages Button - Only show when signed in */}
        {isSignedIn && (
          <button
            onClick={() => router.push("/dashboard/messages")}
            className="relative text-gray-700"
            aria-label="Messages"
          >
            <BsChatLeftDots size={26} />
            {chatCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                {chatCount}
              </span>
            )}
          </button>
        )}

        {/* Profile/Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-700"
        >
          { user ? (
            <Avatar
              src={user.image || user.profilePicture}
              alt={user.firstName || user.email || "User"}
              size={28}
            />
          ) : (
            <IoPersonCircleOutline size={30} />
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute z-50 right-4 top-16 bg-white border border-gray-200 shadow-lg rounded-lg p-2 w-48 flex flex-col space-y-2">
          {/* Navigation Links for Mobile */}
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="w-full text-left hover:bg-gray-100 p-2 duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-gray-200 my-1"></div>
          {/* Add Listing option in dropdown */}
          <button
            onClick={() => {
              handleAddListing();
              setIsMenuOpen(false);
            }}
            className="w-full text-left hover:bg-gray-100 p-2 duration-300"
          >
            {isSignedIn ? "Add Listing" : "Become a seller"}
          </button>
          {isSignedIn && (
            <>
              <button
                onClick={() => {
                  router.push("/dashboard/home");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left hover:bg-gray-100 p-2 duration-300"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  router.push("/dashboard/messages");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left hover:bg-gray-100 p-2 duration-300 flex items-center"
              >
                Messages
                {chatCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                    {chatCount}
                  </span>
                )}
              </button>
            </>
          )}
          {/* Conditionally render Login or Logout based on auth status */}
          {isSignedIn ? (
            <div className="w-full text-left hover:bg-gray-100 p-2 duration-300">
              <SignOutButton />
            </div>
          ) : (
            <div className="w-full text-left hover:bg-gray-100 p-2 duration-300">
              <SignInButton />
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default NavbarUpdated;
