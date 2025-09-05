"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function CombinedResultsTable() {
  const [programsWithResults, setProgramsWithResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamTotals, setTeamTotals] = useState({});
  const [categoryData, setCategoryData] = useState({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gender, setGender] = useState("boys");
  const [showBoys, setShowBoys] = useState(true);

  const categoryOrder = ['sub junior', 'junior', 'senior', 'super senior', 'General'];

  useEffect(() => {
    fetchProgramsWithResults();
  }, [gender, showBoys]);

  useEffect(() => {
    if (loading || isPaused) return;
    
    const timer = setTimeout(() => {
      if (showBoys) {
        setShowBoys(false);
        setGender("girls");
      } else {
        setShowBoys(true);
        setGender("boys");
        setCurrentCategoryIndex((prevIndex) => 
          prevIndex === categoryOrder.length - 1 ? 0 : prevIndex + 1
        );
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentCategoryIndex, loading, isPaused, showBoys]);

  const fetchProgramsWithResults = async () => {
    setLoading(true);
    
    const programsTable = gender === "boys" ? "boysprograms" : "girlsprograms";
    const resultsTable = gender === "boys" ? "results" : "girlesresult";
    
    const { data: programs, error: programsError } = await supabase
      .from(programsTable)
      .select("id, name, category, created_at")
      .order("created_at", { ascending: false });
    
    if (programsError) {
      console.error("Error fetching programs:", programsError);
      setLoading(false);
      return;
    }
    
    const { data: results, error: resultsError } = await supabase
      .from(resultsTable)
      .select("*")
      .order("created_at", { ascending: false });
    
    if (resultsError) {
      console.error("Error fetching results:", resultsError);
      setLoading(false);
      return;
    }
    
    const programsWithResultsData = programs.map(program => {
      const programResults = results.filter(result => result.program_id === program.id);
      const latestResult = programResults.length > 0 ? programResults[0] : null;
      return {
        ...program,
        result: latestResult
      };
    }).filter(program => program.result);
    
    setProgramsWithResults(programsWithResultsData);
    calculateTeamTotals(programsWithResultsData);
    organizeByCategory(programsWithResultsData);
    setLoading(false);
  };

  const calculateTeamTotals = (programs) => {
    const totals = {
      'ഖുസയ': 0,
      'കിനാന': 0,
      'Team C': 0
    };
    
    programs.forEach(program => {
      if (program.result) {
        if (program.result.team_a && program.result.score_a) {
          totals[program.result.team_a] = (totals[program.result.team_a] || 0) + parseInt(program.result.score_a);
        }
        if (program.result.team_b && program.result.score_b) {
          totals[program.result.team_b] = (totals[program.result.team_b] || 0) + parseInt(program.result.score_b);
        }
        if (program.result.team_c && program.result.score_c) {
          totals[program.result.team_c] = (totals[program.result.team_c] || 0) + parseInt(program.result.score_c);
        }
      }
    });
    
    setTeamTotals(totals);
  };

  const organizeByCategory = (programs) => {
    const categories = {
      'sub junior': [],
      'junior': [],
      'senior': [],
      'super senior': [],
      'General': []
    };
    
    programs.forEach(program => {
      const category = program.category.toLowerCase();
      if (categories.hasOwnProperty(category)) {
        categories[category].push(program);
      } else {
        categories['General'].push(program);
      }
    });
    
    setCategoryData(categories);
  };

  const currentCategory = categoryOrder[currentCategoryIndex];
  const currentPrograms = categoryData[currentCategory] || [];
  const displayedPrograms = currentPrograms.slice(0, 9);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {showBoys ? "Boys" : "Girls"} Program Results
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Automatically cycling through categories and gender every 5 seconds
          </p>
        </header>
        
        {/* Mobile Only Message */}
        <div className="md:hidden bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
          <p className="text-sm">Phone no see - Please view on larger screen</p>
        </div>

        {/* Desktop Content (hidden on mobile) */}
        <div className="hidden md:block">
          {/* Controls */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-lg shadow-sm p-3 flex items-center space-x-3">
              <div className="flex flex-wrap gap-2 justify-center">
                {categoryOrder.map((category, index) => (
                  <button
                    key={category}
                    onClick={() => {
                      setCurrentCategoryIndex(index);
                      setShowBoys(true);
                      setGender("boys");
                    }}
                    className={`px-3 py-1 rounded-full text-xs ${
                      currentCategoryIndex === index
                        ? showBoys ? "bg-blue-500 text-white" : "bg-pink-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {category.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : programsWithResults.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No results available</h3>
              <p className="text-gray-500">There are no program results available yet.</p>
            </div>
          ) : (
            <>
              {/* Current Category Table */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
                <div className={`px-6 py-3 border-b flex justify-between items-center ${
                  showBoys ? "bg-blue-100 border-blue-200" : "bg-pink-100 border-pink-200"
                }`}>
                  <h2 className={`text-lg font-semibold capitalize ${
                    showBoys ? "text-blue-800" : "text-pink-800"
                  }`}>
                    {currentCategory} Category - {showBoys ? "Boys" : "Girls"}
                    <span className={`ml-2 text-xs font-normal ${
                      showBoys ? "text-blue-600" : "text-pink-600"
                    }`}>
                      ({displayedPrograms.length} of {currentPrograms.length} programs)
                    </span>
                  </h2>
                  <div className="flex items-center">
                    <span className={`h-3 w-3 rounded-full mr-2 ${isPaused ? 'bg-red-500' : 'bg-green-500'}`}></span>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Program</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">1st</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Mark</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">2nd</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Mark</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">3rd</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Mark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {displayedPrograms.map((program) => (
                        <tr key={program.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{program.name}</td>
                          <td className="px-4 py-3">{program.result.team_a}</td>
                          <td className="px-4 py-3">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              {program.result.score_a}
                            </span>
                          </td>
                          <td className="px-4 py-3">{program.result.team_b}</td>
                          <td className="px-4 py-3">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              {program.result.score_b}
                            </span>
                          </td>
                          <td className="px-4 py-3">{program.result.team_c || "-"}</td>
                          <td className="px-4 py-3">
                            {program.result.team_c ? (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                {program.result.score_c}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            
              
            </>
          )}
        </div>
      </div>
    </div>
  );
}