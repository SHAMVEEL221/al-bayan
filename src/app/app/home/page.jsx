"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 text-white flex flex-col">
      {/* Top Buttons */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/table">
          <button className="bg-red-600 hover:bg-red-700 px-3 py-1 md:px-4 md:py-2 rounded-lg font-bold flex items-center justify-center text-sm md:text-base">
            {/* Table SVG Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
            </svg>
            Table
          </button>
        </Link>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <Link href="/login">
          <button className="bg-white text-blue-900 px-3 py-1 md:px-4 md:py-2 rounded-full font-semibold hover:bg-blue-100 transition-colors text-sm md:text-base">
            Login
          </button>
        </Link>
      </div>

      {/* Logo and Title Section */}
      <div className="flex flex-col items-center pt-16 md:pt-10">
        {/* Logo Placeholder - Replace with your actual logo */}
        <div className="inline-block">
        <Image
            src="/image/logo1.png" // Update this path to your actual image
            alt="Madrasathul Badriyyah, Koyyod"
            width={220}
            height={80}
            draggable="false"
            className="mx-auto"
          />
            
          
        </div>
        
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 text-center">
          മദ്റസത്തുൽ ബദ്‌രിയ്യ, കോയ്യോട്
        </h1>
        <h2 className="text-base md:text-xl lg:text-2xl font-light mb-8 md:mb-12">
          അൻത ഫീഹിം <span className="font-medium">മീലാദ് ഫെസ്റ്റ് -25</span>
        </h2>
      </div>

      {/* Three Button Box Section */}
      <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <div className="mt-4 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl w-full px-4">
          {/* Button 1 - Programs */}
          <Link href="/boyresultsee">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 text-center border border-white/20 hover:bg-white/15 transition-all cursor-pointer">
              <div className="bg-green-500 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 md:h-8 md:w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-base md:text-lg mb-1 md:mb-2">Results</h3>
              <p className="text-xs md:text-sm text-white/80">Check Boys competition results</p>
            </div>
          </Link>

          {/* Button 2 - Results */}
          <Link href="/girlresultsee">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 text-center border border-white/20 hover:bg-white/15 transition-all cursor-pointer">
              <div className="bg-green-500 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 md:h-8 md:w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-base md:text-lg mb-1 md:mb-2">Results</h3>
              <p className="text-xs md:text-sm text-white/80">Check Girls competition results</p>
            </div>
          </Link>

          {/* Button 3 - Total Mark */}
          <Link href="/totelmark">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 text-center border border-white/20 hover:bg-white/15 transition-all cursor-pointer">
              <div className="bg-yellow-500 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 md:h-8 md:w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 11l3 3L22 4M9 4h6a2 2 0 012 2v14a2 2 0 01-2 2H9a2 2 0 01-2-2V6a2 2 0 012-2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-base md:text-lg mb-1 md:mb-2">Total Mark</h3>
              <p className="text-xs md:text-sm text-white/80">View overall marks summary</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer with Image */}
      <footer className="text-center py-4 md:py-6 px-4">
        <div className="inline-block">
          {/* Replace the src with your actual image path */}
          <Image
            src="/image/logo2.png" // Update this path to your actual image
            alt="Madrasathul Badriyyah, Koyyod"
            width={300}
            height={80}
            draggable="false"
            className="mx-auto"
          />
        </div>
      </footer>
    </div>
  );
}