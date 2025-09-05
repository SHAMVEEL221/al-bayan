"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function BoysProgramResults() {
  const [programsWithResults, setProgramsWithResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProgramsWithResults();
  }, []);

  const fetchProgramsWithResults = async () => {
    setLoading(true);

    const { data: programs, error: programsError } = await supabase
      .from("boysprograms")
      .select("id, name, category, created_at")
      .order("created_at", { ascending: false });

    if (programsError) {
      console.error("Error fetching programs:", programsError);
      setLoading(false);
      return;
    }

    const { data: results, error: resultsError } = await supabase
      .from("results")
      .select("*")
      .order("created_at", { ascending: false });

    if (resultsError) {
      console.error("Error fetching results:", resultsError);
      setLoading(false);
      return;
    }

    const programsWithResultsData = programs.map((program) => {
      const programResults = results.filter(
        (result) => result.program_id === program.id
      );
      return {
        ...program,
        results: programResults,
      };
    });

    setProgramsWithResults(programsWithResultsData);
    setLoading(false);
  };

  const filteredPrograms = programsWithResults.filter((program) => {
    const matchesCategory =
      selectedCategory === "all" || program.category === selectedCategory;
    const matchesSearch =
      program.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["all", ...new Set(programsWithResults.map((p) => p.category))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-sm">
            Boys Program Results
          </h1>
          <p className="text-gray-200">അൻത ഫീഹിം_മീലാദ് ഫെസ്റ്റ് -25</p>

        </header>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          {/* Search Bar */}
          <div className="w-full md:w-1/2 relative">
            <input
              type="text"
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/10 backdrop-blur-md text-white placeholder-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <svg
              className="absolute right-4 top-3.5 h-5 w-5 text-gray-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-white text-blue-900 shadow-md"
                    : "bg-white/20 text-white border border-white/30 hover:bg-white/30"
                }`}
              >
                {category === "all"
                  ? "All"
                  : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Programs Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-white"></div>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-md p-10 text-center">
            <h3 className="text-2xl font-semibold text-white mb-2">
              No programs found
            </h3>
            <p className="text-gray-200">
              Try adjusting your search or category filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <div
                key={program.id}
                onClick={() => setSelectedProgram(program)}
                className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all border border-white/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white">
                    {program.name}
                  </h3>
                  <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {program.category}
                  </span>
                </div>
                
                <button className="text-white hover:text-indigo-200 text-sm font-medium">
                  {program.results.length > 0
                    ? "View Results →"
                    : "No Results Yet"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedProgram && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
            <div className="bg-gradient-to-b from-blue-900 to-purple-900 w-full max-w-3xl p-8 rounded-2xl shadow-xl relative max-h-[90vh] overflow-y-auto border border-white/20">
              <button
                className="absolute top-4 right-4 text-white hover:text-gray-300 text-xl"
                onClick={() => setSelectedProgram(null)}
              >
                ✕
              </button>

              <h3 className="text-2xl font-bold text-white mb-2">
                {selectedProgram.name}
              </h3>
              <div className="flex items-center text-sm text-gray-300 mb-6">
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mr-3">
                  {selectedProgram.category}
                </span>
              </div>

              {selectedProgram.results.length > 0 ? (
                <div className="space-y-6">
                  {selectedProgram.results.map((result, index) => (
                    <div
                      key={index}
                      className="bg-white/10 backdrop-blur-md rounded-xl p-5 shadow-sm border border-white/20"
                    >
                      <div className="flex justify-between text-xs text-gray-300 mb-3">
                        <span>
                          Result #{selectedProgram.results.length - index}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/20 rounded-lg p-4 shadow text-center border border-white/20">
                          <div className="text-xl font-bold text-white mb-1">
                            {result.score_a}
                          </div>
                          <div className="text-sm font-medium text-gray-200">
                            {result.team_a}
                          </div>
                        </div>

                        <div className="bg-white/20 rounded-lg p-4 shadow text-center border border-white/20">
                          <div className="text-xl font-bold text-white mb-1">
                            {result.score_b}
                          </div>
                          <div className="text-sm font-medium text-gray-200">
                            {result.team_b}
                          </div>
                        </div>

                        {result.team_c && (
                          <div className="bg-white/20 rounded-lg p-4 shadow text-center border border-white/20">
                            <div className="text-xl font-bold text-white mb-1">
                              {result.score_c}
                            </div>
                            <div className="text-sm font-medium text-gray-200">
                              {result.team_c}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-300">
                  <p>No results have been published yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}