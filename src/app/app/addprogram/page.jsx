"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";


// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function useAuth() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const authData = localStorage.getItem("auth");
    
    if (!authData) {
      // Redirect to login if not authenticated
      router.push("/login");
      return;
    }

    try {
      const { isAuthenticated } = JSON.parse(authData);
      
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.push("/login");
      }
    } catch (error) {
      // If there's an error parsing the auth data, redirect to login
      router.push("/login");
    }
  }, [router]);

  return null;
}

export default function AddProgramForm() {
  // Add authentication check
  useAuth();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("sub junior");
  const [gender, setGender] = useState("boys");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const table = gender === "boys" ? "boysprograms" : "girlsprograms";

      const { error } = await supabase.from(table).insert([
        {
          name,
          category,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
      setMessage("✅ Program saved successfully!");
      setName("");
      setCategory("sub junior");
      setGender("boys");
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Remove authentication data from localStorage
    localStorage.removeItem("auth");
    
    // Redirect to login page
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 text-white">
      {/* Navigation Bar */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/20 text-white">
                Dashboard
                </Link>
                <Link href="/addprogram" className="px-3 py-2 rounded-md text-sm font-medium bg-white/20 text-white">
                Add Program
                </Link>
                <Link href="/boysresult" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white/20">
                  Boys Result
                </Link>
                <Link href="/girlesresult" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white/20">
                  Girls Result
                </Link>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white focus:outline-none"
              >
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-blue-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link 
                href="/dashboard" 
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>

              <Link 
                href="/addprogram" 
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-white/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Add Program
              </Link>
              
              <Link 
                href="/boysresult" 
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Boys Result
              </Link>
              <Link 
                href="/girlesresult" 
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Girls Result
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Header Section */}
      <div className="text-center py-8 px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">മദ്റസത്തുൽ ബദ്‌രിയ്യ, കോയ്യോട്</h1>
        <h2 className="text-lg md:text-xl text-gray-200">
          <span className="italic">അൻത ഫീഹിം</span>
          <span className="mx-2">-</span>
          <span className="font-medium">മീലാദ് ഫെസ്റ്റ് -25</span>
        </h2>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/20">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Add Program</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Program Name */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-200">Program Name</label>
              <input
                type="text"
                className="w-full border border-white/30 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/10 text-white placeholder-gray-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter program name"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-200">Category</label>
              <select
                className="w-full border border-white/30 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/10 text-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="sub junior" className="bg-blue-900">Sub Junior</option>
                <option value="junior" className="bg-blue-900">Junior</option>
                <option value="senior" className="bg-blue-900">Senior</option>
                <option value="super senior" className="bg-blue-900">Super Senior</option>
                <option value="General" className="bg-blue-900">General</option>
              </select>
            </div>

            {/* Boys or Girls */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-200">For</label>
              <div className="flex gap-6 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="boys"
                    checked={gender === "boys"}
                    onChange={() => setGender("boys")}
                    className="text-blue-500"
                  />
                  Boys
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="girls"
                    checked={gender === "girls"}
                    onChange={() => setGender("girls")}
                    className="text-blue-500"
                  />
                  Girls
                </label>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-white text-blue-900 py-3 rounded-lg font-semibold hover:bg-blue-100 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Program"}
            </button>
          </form>

          {message && (
            <p className="mt-5 text-center text-sm font-medium text-white">{message}</p>
          )}
        </div>
      </div>

      {/* Logout Button */}
      
      <div className="fixed bottom-4 right-4">
      <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2 shadow-lg"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}