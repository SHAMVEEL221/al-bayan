"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Authentication hook
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

export default function Dashboard() {
  // Add authentication check
  useAuth();
  
  // State variables
  const [programs, setPrograms] = useState([]);
  const [girlsPrograms, setGirlsPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamTotals, setTeamTotals] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Stats for overview
  const [stats, setStats] = useState({
    totalPrograms: 0,
    totalResults: 0,
    leadingTeam: ""
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchPrograms(),
      fetchGirlsPrograms(),
      fetchTeamTotals(),
      fetchStats()
    ]);
    setLoading(false);
  };

  const fetchStats = async () => {
    // Fetch boys programs count
    const { count: boysCount } = await supabase
      .from("boysprograms")
      .select("*", { count: 'exact' });
    
    // Fetch girls programs count
    const { count: girlsCount } = await supabase
      .from("girlsprograms")
      .select("*", { count: 'exact' });
    
    // Fetch results count
    const { count: resultsCount } = await supabase
      .from("results")
      .select("*", { count: 'exact' });
    
    // Determine leading team
    const { data: teamData } = await supabase
      .from("totelmark")
      .select("*")
      .order("mark", { ascending: false });
    
    setStats({
      totalPrograms: (boysCount || 0) + (girlsCount || 0),
      totalResults: resultsCount || 0,
      leadingTeam: teamData && teamData.length > 0 ? teamData[0].team : "None"
    });
  };

  const fetchPrograms = async () => {
    const { data, error } = await supabase
      .from("boysprograms")
      .select("id, name, category, created_at")
      .order("created_at", { ascending: false });
    if (!error) setPrograms(data);
  };

  const fetchGirlsPrograms = async () => {
    const { data, error } = await supabase
      .from("girlsprograms")
      .select("id, name, category, created_at")
      .order("created_at", { ascending: false });
    if (!error) setGirlsPrograms(data);
  };

  const fetchTeamTotals = async () => {
    const { data, error } = await supabase
      .from("totelmark")
      .select("*")
      .order("mark", { ascending: false });
    
    if (!error && data) {
      const totals = {};
      data.forEach(team => {
        totals[team.team] = team.mark;
      });
      setTeamTotals(totals);
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
                <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium bg-white/20 text-white">
                Dashboard
                </Link>
                <Link href="/addprogram" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/20 text-white">
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
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-white/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>

              <Link 
                href="/addprogram" 
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/20"
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
      <div className="px-4 pb-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-white text-xl">Loading data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Event Overview</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-white">Total Programs</h3>
                <p className="text-3xl font-bold text-blue-300 mt-2">{stats.totalPrograms}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-white">Results Recorded</h3>
                <p className="text-3xl font-bold text-blue-300 mt-2">{stats.totalResults}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-white">Leading Team</h3>
                <p className="text-3xl font-bold text-blue-300 mt-2">{stats.leadingTeam}</p>
              </div>
            </div>
            
            {/* Team Totals */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-white">Team Scores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(teamTotals).map(([team, score]) => (
                  <div key={team} className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-semibold text-white">{team}</h4>
                      <span className="text-2xl font-bold text-blue-300">
                        {score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent Programs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-white">Recent Boys Programs</h3>
                <div className="space-y-3">
                  {programs.slice(0, 5).map((program) => (
                    <div key={program.id} className="bg-white/5 p-3 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white">{program.name}</h4>
                      <p className="text-sm text-gray-300 capitalize">{program.category}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-white">Recent Girls Programs</h3>
                <div className="space-y-3">
                  {girlsPrograms.slice(0, 5).map((program) => (
                    <div key={program.id} className="bg-white/5 p-3 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white">{program.name}</h4>
                      <p className="text-sm text-gray-300 capitalize">{program.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
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