"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TotalMarksPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTotalMarks();
  }, []);

  const fetchTotalMarks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('totelmark')
        .select('*')
        .order('mark', { ascending: false });

      if (error) {
        throw error;
      }

      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching total marks:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-white text-center max-w-md mx-auto">
          <p className="text-xl mb-4">Error: {error}</p>
          <button 
            onClick={fetchTotalMarks}
            className="bg-white text-blue-900 px-6 py-2 rounded-full font-semibold hover:bg-blue-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 text-white">
      {/* Header */}
      <header className="text-center py-6 px-4 md:py-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
          മദ്റസത്തുൽ ബദ്‌രിയ്യ, കോയ്യോട്
        </h1>
        <h2 className="text-lg md:text-xl lg:text-2xl font-light mb-4 md:mb-6">
          അൻത ഫീഹിം <span className="font-medium">മീലാദ് ഫെസ്റ്റ് -25</span>
        </h2>
        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-yellow-300">
          Total Marks
        </h3>
      </header>

      {/* Team Marks Table */}
      <div className="container mx-auto px-4 pb-8 md:pb-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/20">
            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3">
              {teams.map((team, index) => (
                <div
                  key={team.id}
                  className={`bg-white/5 rounded-lg p-4 border border-white/10 ${
                    index === 0 ? 'bg-yellow-500/20 border-yellow-400/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-yellow-500 text-black font-bold' : 
                        index === 1 ? 'bg-gray-400 text-black font-bold' : 
                        index === 2 ? 'bg-amber-800 text-white font-bold' : 
                        'bg-white/10 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-sm">{team.team}</span>
                    </div>
                    <span className="font-bold text-lg">{team.mark}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 font-semibold">Position</th>
                    <th className="text-left py-3 px-4 font-semibold">Team</th>
                    <th className="text-right py-3 px-4 font-semibold">Total Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, index) => (
                    <tr 
                      key={team.id} 
                      className={`border-b border-white/10 ${
                        index === 0 ? 'bg-yellow-500/20' : ''
                      } hover:bg-white/5 transition-colors`}
                    >
                      <td className="py-3 px-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-500 text-black font-bold' : 
                          index === 1 ? 'bg-gray-400 text-black font-bold' : 
                          index === 2 ? 'bg-amber-800 text-white font-bold' : 
                          'bg-white/10 text-white'
                        }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {team.team}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-xl">
                        {team.mark}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="text-center pb-6 md:pb-8 px-4">
        <button 
          onClick={() => window.history.back()}
          className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full transition-colors text-sm md:text-base"
        >
          ← Back
        </button>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 md:py-6 px-4">
        <button className="bg-white/20 hover:bg-white/30 text-white/80 px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm transition-colors">
          © 2025 മദ്റസത്തുൽ ബദ്‌രിയ്യ, കോയ്യോട്. All rights reserved.
        </button>
      </footer>
    </div>
  );
}