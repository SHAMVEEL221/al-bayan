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

export default function BoysProgramsWithResults() {
  // Add authentication check
  useAuth();
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [latestResult, setLatestResult] = useState(null);
  // Teams
  const [teams, setTeams] = useState(["ഖുസയ്യ്", "കിനാന"]);
  // Form states
  const [teamA, setTeamA] = useState("");
  const [scoreA, setScoreA] = useState(0);
  const [teamB, setTeamB] = useState("");
  const [scoreB, setScoreB] = useState(0);
  const [teamC, setTeamC] = useState("");
  const [scoreC, setScoreC] = useState(0);
  
  // Team totals state
  const [teamTotals, setTeamTotals] = useState({});
  const [showTeamTotals, setShowTeamTotals] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState([]);
  
  // Track which programs have results
  const [programsWithResults, setProgramsWithResults] = useState({});

  useEffect(() => {
    fetchPrograms();
    fetchTeamTotals();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("boysprograms")
      .select("id, name, category, created_at")
      .order("created_at", { ascending: false });
      
    if (!error) {
      setPrograms(data);
      setFilteredPrograms(data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(item => item.category))];
      setCategories(uniqueCategories);
      
      // Check which programs have results
      checkProgramsWithResults(data);
    }
    setLoading(false);
  };

  // Check which programs have results
  const checkProgramsWithResults = async (programsData) => {
    const resultsMap = {};
    
    for (const program of programsData) {
      const { data, error } = await supabase
        .from("results")
        .select("id")
        .eq("program_id", program.id)
        .limit(1);
      
      resultsMap[program.id] = !error && data && data.length > 0;
    }
    
    setProgramsWithResults(resultsMap);
  };

  // Filter programs based on search and category
  useEffect(() => {
    let filtered = programs;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(program => 
        program.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(program => 
        program.category === categoryFilter
      );
    }
    
    setFilteredPrograms(filtered);
  }, [searchQuery, categoryFilter, programs]);

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

  const fetchResults = async (programId) => {
    const { data, error } = await supabase
      .from("results")
      .select("*")
      .eq("program_id", programId)
      .order("created_at", { ascending: false })
      .limit(1);
    if (!error && data.length > 0) {
      const latest = data[0];
      setLatestResult(latest);
      setTeamA(latest.team_a);
      setScoreA(latest.score_a);
      setTeamB(latest.team_b);
      setScoreB(latest.score_b);
      setTeamC(latest.team_c);
      setScoreC(latest.score_c);
    } else {
      setLatestResult(null);
      setTeamA("");
      setScoreA(0);
      setTeamB("");
      setScoreB(0);
      setTeamC("");
      setScoreC(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (latestResult) {
      // Update existing row
      const { error } = await supabase
        .from("results")
        .update({
          team_a: teamA,
          score_a: parseInt(scoreA, 10),
          team_b: teamB,
          score_b: parseInt(scoreB, 10),
          team_c: teamC,
          score_c: parseInt(scoreC, 10),
        })
        .eq("id", latestResult.id);
      if (error) {
        setMessage(`❌ Error: ${error.message}`);
      } else {
        setMessage("✅ Result updated successfully!");
        // Update team totals after saving result
        updateTeamTotals();
        // Refresh results status
        checkProgramsWithResults(programs);
      }
    } else {
      // Insert new row
      const { error } = await supabase.from("results").insert([
        {
          program_id: selectedProgram.id,
          team_a: teamA,
          team_b: teamB,
          team_c: teamC,
          score_a: parseInt(scoreA, 10),
          score_b: parseInt(scoreB, 10),
          score_c: parseInt(scoreC, 10),
          created_at: new Date().toISOString(),
        },
      ]);
      if (error) {
        setMessage(`❌ Error: ${error.message}`);
      } else {
        setMessage("✅ Result saved successfully!");
        // Update team totals after saving result
        updateTeamTotals();
        // Refresh results status
        checkProgramsWithResults(programs);
      }
    }
    setTimeout(() => {
      setMessage("");
    }, 1500);
  };

  const updateTeamTotals = async () => {
    // Calculate new totals based on all results
    const { data: results, error } = await supabase
      .from("results")
      .select("*");
    
    if (!error && results) {
      const totals = {
        'ഖുസയ്യ്': 0,
        'കിനാന': 0
      };
      
      results.forEach(result => {
        if (result.team_a && result.score_a) {
          totals[result.team_a] = (totals[result.team_a] || 0) + parseInt(result.score_a);
        }
        if (result.team_b && result.score_b) {
          totals[result.team_b] = (totals[result.team_b] || 0) + parseInt(result.score_b);
        }
        if (result.team_c && result.score_c) {
          totals[result.team_c] = (totals[result.team_c] || 0) + parseInt(result.score_c);
        }
      });
      
      // Update the team totals in the database
      for (const [team, mark] of Object.entries(totals)) {
        // First check if the team already exists
        const { data: existingTeam } = await supabase
          .from("totelmark")
          .select("*")
          .eq("team", team)
          .single();
        
        if (existingTeam) {
          // Update existing record
          const { error: updateError } = await supabase
            .from("totelmark")
            .update({ mark: parseInt(mark, 10) })
            .eq("team", team);
          
          if (updateError) {
            console.error(`Error updating team ${team}:`, updateError);
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from("totelmark")
            .insert([{ team, mark: parseInt(mark, 10) }]);
          
          if (insertError) {
            console.error(`Error inserting team ${team}:`, insertError);
          }
        }
      }
      
      // Refresh the team totals display
      fetchTeamTotals();
    }
  };

  const handleManualTeamTotalUpdate = async (team, newMark) => {
    if (!newMark || isNaN(newMark)) {
      setMessage(`❌ Please enter a valid number for ${team}`);
      setTimeout(() => setMessage(""), 1500);
      return;
    }

    // First check if the team already exists
    const { data: existingTeam } = await supabase
      .from("totelmark")
      .select("*")
      .eq("team", team)
      .single();
    
    let error;
    if (existingTeam) {
      // Update existing record
      const { error: updateError } = await supabase
        .from("totelmark")
        .update({ mark: parseInt(newMark, 10) })
        .eq("team", team);
      error = updateError;
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from("totelmark")
        .insert([{ team, mark: parseInt(newMark, 10) }]);
      error = insertError;
    }
    
    if (error) {
      setMessage(`❌ Error updating ${team}: ${error.message}`);
    } else {
      setMessage(`✅ ${team} total updated to ${newMark}`);
      fetchTeamTotals();
    }
    
    setTimeout(() => {
      setMessage("");
    }, 1500);
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
                <Link href="/addprogram" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/20 text-white">
                Add Program
                </Link>
                <Link href="/boysresult" className="px-3 py-2 rounded-md text-sm font-medium text-white bg-white/20">
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
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Add Program
              </Link>
              
              <Link 
                href="/boysresult" 
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-white/20"
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
      <div className="px-4 pb-8">
        {/* Team Totals Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowTeamTotals(!showTeamTotals)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {showTeamTotals ? "Hide Team Totals" : "Show Team Totals"}
          </button>
        </div>
        
        {/* Team Totals Display */}
        {showTeamTotals && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold mb-4 text-center text-white">Team Totals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => (
                <div key={team} className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold text-white">{team}</h4>
                    <span className="text-2xl font-bold text-blue-300">
                      {teamTotals[team] || 0}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      className="flex-1 border border-white/30 rounded-lg p-2 bg-white/10 text-white placeholder-gray-300"
                      placeholder="New total"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleManualTeamTotalUpdate(team, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        handleManualTeamTotalUpdate(team, input.value);
                        input.value = '';
                      }}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={updateTeamTotals}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Recalculate Totals from Results
              </button>
            </div>
          </div>
        )}
        
        {/* Search and Filter Section */}
        <div className="max-w-6xl mx-auto mb-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
          <h2 className="text-2xl font-bold text-center mb-4 text-white">Boys Programs</h2>
          
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search Input */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-white/30 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/10 text-white placeholder-gray-300"
              />
            </div>
            
            {/* Category Filter */}
            <div className="w-full md:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-white/30 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/10 text-white"
              >
                <option value="all" className="bg-blue-900">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-blue-900 capitalize">
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Clear Filters Button */}
            <div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                }}
                className="w-full md:w-auto bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="text-sm text-gray-300">
            Showing {filteredPrograms.length} of {programs.length} programs
          </div>
        </div>
        
        {/* Programs Grid */}
        {loading ? (
          <p className="text-center text-white">Loading...</p>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center py-8 text-gray-300">
            No programs found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredPrograms.map((program) => (
              <div
                key={program.id}
                onClick={() => {
                  setSelectedProgram(program);
                  fetchResults(program.id);
                }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 cursor-pointer hover:shadow-2xl transition hover:bg-white/15 relative"
              >
                {/* Status indicator dot */}
                <div className="absolute top-3 right-3">
                  <div className={`w-3 h-3 rounded-full ${
                    programsWithResults[program.id] 
                      ? "bg-green-500 ring-2 ring-green-400" 
                      : "bg-gray-500 ring-2 ring-gray-400"
                  }`}></div>
                </div>
                
                <h3 className="text-lg font-semibold text-white pr-6">{program.name}</h3>
                <p className="text-sm text-gray-200 capitalize">
                  {program.category}
                </p>
                <p className="text-xs text-gray-300 mt-2">
                  {new Date(program.created_at).toLocaleDateString()}
                </p>
                
                {/* Status text */}
                <p className="text-xs mt-2">
                  {programsWithResults[program.id] 
                    ? <span className="text-green-400">✓ Result published</span> 
                    : <span className="text-gray-400">✗ No result yet</span>
                  }
                </p>
              </div>
            ))}
          </div>
        )}
        
        {/* Modal */}
        {selectedProgram && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <div className="bg-gradient-to-b from-blue-900 to-purple-900 w-full max-w-3xl p-6 rounded-2xl shadow-lg relative overflow-y-auto max-h-[90vh] border border-white/20">
              <button
                className="absolute top-3 right-3 text-white hover:text-gray-300"
                onClick={() => setSelectedProgram(null)}
              >
                ✖
              </button>
              <h3 className="text-xl font-bold mb-4 text-center text-white">
                {latestResult ? "Edit Result" : "Add Result"}:{" "}
                {selectedProgram.name}
              </h3>
              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="font-semibold text-white">Team</div>
                  <div className="font-semibold text-white">Mark</div>
                  {/* Team A */}
                  <div>
                    <select
                      className="w-full border border-white/30 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/10 text-white"
                      value={teamA}
                      onChange={(e) => setTeamA(e.target.value)}
                      required
                    >
                      <option value="" className="bg-blue-900">Select team</option>
                      {teams.map((t) => (
                        <option key={t} value={t} className="bg-blue-900">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      className="w-full border border-white/30 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/10 text-white"
                      value={scoreA}
                      onChange={(e) => setScoreA(e.target.value)}
                      required
                    />
                  </div>
                  {/* Team B */}
                  <div>
                    <select
                      className="w-full border border-white/30 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/10 text-white"
                      value={teamB}
                      onChange={(e) => setTeamB(e.target.value)}
                      required
                    >
                      <option value="" className="bg-blue-900">Select team</option>
                      {teams.map((t) => (
                        <option key={t} value={t} className="bg-blue-900">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      className="w-full border border-white/30 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/10 text-white"
                      value={scoreB}
                      onChange={(e) => setScoreB(e.target.value)}
                      required
                    />
                  </div>
                  {/* Team C */}
                  <div>
                    <select
                      className="w-full border border-white/30 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/10 text-white"
                      value={teamC}
                      onChange={(e) => setTeamC(e.target.value)}
                    >
                      <option value="" className="bg-blue-900">Select team (Optional)</option>
                      {teams.map((t) => (
                        <option key={t} value={t} className="bg-blue-900">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      className="w-full border border-white/30 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/10 text-white"
                      value={scoreC}
                      onChange={(e) => setScoreC(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-blue-900 py-3 rounded-lg font-semibold hover:bg-blue-100 transition"
                >
                  {latestResult ? "Update Result" : "Save Result"}
                </button>
              </form>
              {message && (
                <p className="mt-4 text-center text-sm font-medium text-white">{message}</p>
              )}
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