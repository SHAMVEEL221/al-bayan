
"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Custom hook to get window size
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

export default function Scoreboard() {
  const categories = {
    "Sub Junior": [
      "Qira'at & Hifl",
      "Malayalam speech",
      "Madhunnabi Song",
      "Community Song",
      "Storytelling",
      "Handwritten (Arabic / Malayalam)",
      "Pencil Drawing",
      "Memory test",
    ],
    Junior: [
      "Qira'at & Hifl",
      "Madhunnabi Song",
      "Arabic song",
      "Community Song",
      "Malayalam speech",
      "Bank",
      "Master Hunt",
      "Handwritten (Arabic)",
      "Painting (Watercolor)",
    ],
    Senior: [
      "Qira'at & Hifl",
      "Malayalam song",
      "Arabic song",
      "Maple Song",
      "Community Song",
      "Malayalam speech",
      "Bank",
      "Calligraphy (Arabic)",
      "Malayalam essay",
    ],
    "Super Senior": [
      "Qira'at & Hifl",
      "Malayalam song",
      "Arabic song",
      "Maple Song",
      "Community Song",
      "Malayalam speech",
      "Bank",
      "Poster Designing",
      "Malayalam essay",
    ],
    "General Programs": [
      "Qira'at & Hifl",
      "Community Song",
      "Malayalam Speech",
      "Arabic Song",
      "Poster Designing",
    ],
  };
  const teams = ["Team A", "Team B"];
  const fields = ["Mark1", "Mark2", "Mark3"];
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publishStatus, setPublishStatus] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formValues, setFormValues] = useState({});
  const { width } = useWindowSize();
  const isPhone = width <= 640; // Phone view for ≤640px

  // Fetch scores from Supabase
  useEffect(() => {
    async function fetchScores() {
      try {
        const { data, error } = await supabase
          .from("scores")
          .select(`
            mark1, mark2, mark3, published,
            programs (name, categories (name)),
            teams (name)
          `);

        if (error) {
          console.error("Error fetching scores:", error);
          setError("Failed to load scores");
          setLoading(false);
          return;
        }

        const newScores = {};
        data.forEach((score) => {
          const category = score.programs.categories.name;
          const program = score.programs.name;
          const team = score.teams.name;

          if (!newScores[category]) newScores[category] = {};
          if (!newScores[category][program]) newScores[category][program] = {};
          if (!newScores[category][program][team]) newScores[category][program][team] = {};

          newScores[category][program][team].Mark1 = score.mark1;
          newScores[category][program][team].Mark2 = score.mark2;
          newScores[category][program][team].Mark3 = score.mark3;
          newScores[category][program][team].published = score.published;
        });

        setScores(newScores);
        setLoading(false);
      } catch (err) {
        console.error("Unexpected error fetching scores:", err);
        setError("Unexpected error occurred");
        setLoading(false);
      }
    }

    fetchScores();
  }, []);

  // Handle change in table inputs (desktop only)
  const handleChange = async (category, program, team, field, value) => {
    try {
      const parsedValue = value === "" ? 0 : parseInt(value) || 0;

      if (!category || !program || !team || !field) {
        console.error("Invalid input:", { category, program, team, field });
        return;
      }

      setScores((prev) => ({
        ...prev,
        [category]: {
          ...prev[category] || {},
          [program]: {
            ...prev[category]?.[program] || {},
            [team]: {
              ...prev[category]?.[program]?.[team] || {},
              [field]: parsedValue,
            },
          },
        },
      }));

      const { data: programData, error: programError } = await supabase
        .from("programs")
        .select(`
          id,
          categories!inner(name)
        `)
        .eq("name", program)
        .eq("categories.name", category)
        .single();

      if (programError || !programData) {
        console.error("Error fetching program:", {
          error: programError?.message,
          category,
          program,
        });
        return;
      }

      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("id")
        .eq("name", team)
        .single();

      if (teamError || !teamData) {
        console.error("Error fetching team:", {
          error: teamError?.message,
          team,
        });
        return;
      }

      const updateData = { [field.toLowerCase()]: parsedValue };
      const { error: upsertError } = await supabase
        .from("scores")
        .upsert(
          {
            program_id: programData.id,
            team_id: teamData.id,
            ...updateData,
            published: scores[category]?.[program]?.[team]?.published || false,
          },
          { onConflict: ["program_id", "team_id"] }
        );

      if (upsertError) {
        console.error("Error saving score:", {
          error: upsertError.message,
          program_id: programData.id,
          team_id: teamData.id,
          updateData,
        });
      }
    } catch (error) {
      console.error("Unexpected error in handleChange:", {
        error: error.message,
        category,
        program,
        team,
        field,
        value,
      });
    }
  };

  // Handle form input changes (phone only)
  const handleFormChange = (team, field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [team]: {
        ...prev[team],
        [field]: value === "" ? 0 : parseInt(value) || 0,
      },
    }));
  };

  // Handle publish click to show form (phone only)
  const handlePublishClick = (category, program) => {
    setSelectedCategory(category);
    setSelectedProgram(program);
    const initialFormValues = {};
    teams.forEach((team) => {
      initialFormValues[team] = {
        Mark1: scores[category]?.[program]?.[team]?.Mark1 || 0,
        Mark2: scores[category]?.[program]?.[team]?.Mark2 || 0,
        Mark3: scores[category]?.[program]?.[team]?.Mark3 || 0,
      };
    });
    setFormValues(initialFormValues);
  };

  // Handle confirm publish (phone only)
  const handleConfirmPublish = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Are you sure you want to publish scores for ${selectedProgram} in ${selectedCategory}?`)) {
      return;
    }

    try {
      setPublishStatus(`Publishing ${selectedProgram}...`);
      const { data: programData, error: programError } = await supabase
        .from("programs")
        .select(`
          id,
          categories!inner(name)
        `)
        .eq("name", selectedProgram)
        .eq("categories.name", selectedCategory)
        .single();

      if (programError || !programData) {
        console.error("Error fetching program:", {
          error: programError?.message,
          category: selectedCategory,
          program: selectedProgram,
        });
        setPublishStatus("Failed to publish scores: Program not found");
        return;
      }

      for (const team of teams) {
        const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .select("id")
          .eq("name", team)
          .single();

        if (teamError || !teamData) {
          console.error("Error fetching team:", {
            error: teamError?.message,
            team,
          });
          continue;
        }

        const updateData = {
          program_id: programData.id,
          team_id: teamData.id,
          mark1: formValues[team].Mark1,
          mark2: formValues[team].Mark2,
          mark3: formValues[team].Mark3,
          published: true, // Always publish
        };

        const { error: upsertError } = await supabase
          .from("scores")
          .upsert(updateData, { onConflict: ["program_id", "team_id"] });

        if (upsertError) {
          console.error("Error saving score:", {
            error: upsertError.message,
            program_id: programData.id,
            team_id: teamData.id,
            updateData,
          });
          setPublishStatus("Failed to publish scores");
          return;
        }
      }

      setScores((prev) => ({
        ...prev,
        [selectedCategory]: {
          ...prev[selectedCategory] || {},
          [selectedProgram]: {
            ...prev[selectedCategory]?.[selectedProgram] || {},
            ...teams.reduce((acc, team) => ({
              ...acc,
              [team]: {
                ...prev[selectedCategory]?.[selectedProgram]?.[team],
                ...formValues[team],
                published: true,
              },
            }), {}),
          },
        },
      }));

      setPublishStatus(`Scores for ${selectedProgram} published successfully!`);
      setTimeout(() => setPublishStatus(null), 3000);
      setSelectedProgram(null);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Unexpected error in handleConfirmPublish:", error);
      setPublishStatus("Unexpected error occurred");
    }
  };

  // Handle publish for all scores (desktop only)
  const handlePublish = async () => {
    if (!window.confirm("Are you sure you want to publish all scores? This action cannot be undone.")) {
      return;
    }

    try {
      setPublishStatus("Publishing...");
      const { error } = await supabase
        .from("scores")
        .update({ published: true })
        .neq("mark1", 0)
        .neq("mark2", 0)
        .neq("mark3", 0);

      if (error) {
        console.error("Error publishing scores:", error);
        setPublishStatus("Failed to publish scores");
        return;
      }

      setPublishStatus("Scores published successfully!");
      setTimeout(() => setPublishStatus(null), 3000);

      setScores((prev) => {
        const newScores = { ...prev };
        Object.keys(newScores).forEach((category) => {
          Object.keys(newScores[category]).forEach((program) => {
            Object.keys(newScores[category][program]).forEach((team) => {
              if (
                newScores[category][program][team].Mark1 !== 0 ||
                newScores[category][program][team].Mark2 !== 0 ||
                newScores[category][program][team].Mark3 !== 0
              ) {
                newScores[category][program][team].published = true;
              }
            });
          });
        });
        return newScores;
      });
    } catch (error) {
      console.error("Unexpected error publishing scores:", error);
      setPublishStatus("Unexpected error occurred");
    }
  };

  // Initialize missing scores to 0
  const getScore = (category, program, team, field) => {
    return scores[category]?.[program]?.[team]?.[field] ?? 0;
  };

  // Calculate section totals (desktop only)
  const sectionTotals = {};
  for (const [category, programs] of Object.entries(categories)) {
    sectionTotals[category] = {};
    teams.forEach((team) => {
      sectionTotals[category][team] = programs.reduce((sum, program) => {
        return (
          sum +
          getScore(category, program, team, "Mark1") +
          getScore(category, program, team, "Mark2") +
          getScore(category, program, team, "Mark3")
        );
      }, 0);
    });
  }

  // Calculate grand totals (desktop only)
  const grandTotals = {};
  teams.forEach((team) => {
    grandTotals[team] = Object.values(sectionTotals).reduce(
      (sum, catTotals) => sum + (catTotals[team] || 0),
      0
    );
  });

  if (loading) {
    return <div className="p-4 sm:p-6 text-center text-white text-sm sm:text-base">Loading scores...</div>;
  }

  if (error) {
    return <div className="p-4 sm:p-6 text-center text-red-400 text-sm sm:text-base">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-b from-gray-950 to-gray-900 min-h-screen text-gray-100">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 sm:mb-6 text-center text-blue-400 drop-shadow-lg">
        📊 Premium Scoreboard (Admin)
      </h1>
      {!isPhone && (
        <div className="mb-4 sm:mb-6 flex justify-center">
          <button
            onClick={handlePublish}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-500 transition-all text-sm sm:text-base"
          >
            Publish Marks
          </button>
        </div>
      )}
      {publishStatus && (
        <div
          className={`mb-4 sm:mb-6 text-center text-sm sm:text-base ${
            publishStatus.includes("Failed") || publishStatus.includes("error")
              ? "text-red-400"
              : "text-green-400"
          }`}
        >
          {publishStatus}
        </div>
      )}
      {isPhone && selectedProgram && selectedCategory && (
        <div className="mb-4 bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-base font-bold text-blue-400 mb-3">
            Publish Scores: {selectedProgram} ({selectedCategory})
          </h2>
          <form onSubmit={handleConfirmPublish}>
            {teams.map((team) => (
              <div key={team} className="mb-3">
                <h3 className="text-xs font-semibold text-gray-200 mb-2">{team}</h3>
                <div className="grid grid-cols-1 gap-2">
                  {fields.map((field) => (
                    <div key={`${team}-${field}`}>
                      <label className="block text-xs text-gray-300 mb-1">{field}</label>
                      <input
                        type="number"
                        value={formValues[team][field] || ""}
                        onChange={(e) => handleFormChange(team, field, e.target.value)}
                        className="w-full text-xs text-center border rounded bg-gray-900 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                        onWheel={(e) => e.target.blur()}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="px-2 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs"
              >
                Confirm Publish
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl shadow-2xl">
        {isPhone ? (
          <table className="min-w-full border border-gray-700 rounded-lg text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-blue-900 to-blue-700 text-gray-100">
                <th className="border p-2 text-left text-xs sticky left-0 bg-blue-900 z-10">
                  Category / Program
                </th>
                <th className="border p-2 text-center text-xs">Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categories).map(([category, programs]) => (
                <React.Fragment key={category}>
                  <tr className="bg-gray-900 text-white">
                    <td
                      colSpan={2}
                      className="border p-2 font-bold text-sm tracking-wide sticky left-0 bg-gray-900 z-10"
                    >
                      🔹 {category}
                    </td>
                  </tr>
                  {programs.map((program) => (
                    <tr key={program} className="hover:bg-gray-800 transition">
                      <td className="border p-2 sticky left-0 bg-gray-900 z-10">
                        <span className="text-xs">
                          {program}
                          {scores[category]?.[program]?.[teams[0]]?.published && (
                            <span className="ml-1 text-green-400 text-xs">✅ Published</span>
                          )}
                        </span>
                      </td>
                      <td className="border p-2 text-center">
                        <button
                          onClick={() => handlePublishClick(category, program)}
                          className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs"
                        >
                          Publish
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full border border-gray-700 rounded-lg text-sm md:text-base">
            <thead>
              <tr className="bg-gradient-to-r from-blue-900 to-blue-700 text-gray-100">
                <th className="border p-3 text-left text-base md:text-lg sticky left-0 bg-blue-900 z-10">
                  Category / Program
                </th>
                {teams.map((team) => (
                  <th
                    key={team}
                    className="border p-3 text-center text-base md:text-lg"
                    colSpan={fields.length}
                  >
                    {team}
                  </th>
                ))}
              </tr>
              <tr className="bg-gray-800 text-gray-300 text-sm">
                <th className="border p-2 sticky left-0 bg-gray-800 z-10"></th>
                {teams.map((team) =>
                  fields.map((field) => (
                    <th key={`${team}-${field}`} className="border p-2 text-center text-sm">
                      {field}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {Object.entries(categories).map(([category, programs]) => (
                <React.Fragment key={category}>
                  <tr className="bg-gray-900 text-white">
                    <td
                      colSpan={teams.length * fields.length + 1}
                      className="border p-3 font-bold text-lg tracking-wide sticky left-0 bg-gray-900 z-10"
                    >
                      🔹 {category}
                    </td>
                  </tr>
                  {programs.map((program) => (
                    <tr key={program} className="hover:bg-gray-800 transition">
                      <td className="border p-3 sticky left-0 bg-gray-900 z-10">
                        {program}
                        {scores[category]?.[program]?.[teams[0]]?.published && (
                          <span className="ml-2 text-green-400 text-sm">✅ Published</span>
                        )}
                      </td>
                      {teams.map((team) =>
                        fields.map((field) => (
                          <td
                            key={`${team}-${program}-${field}`}
                            className="border p-2 text-center"
                          >
                            <input
                              type="number"
                              value={getScore(category, program, team, field) || ""}
                              onChange={(e) =>
                                handleChange(category, program, team, field, e.target.value)
                              }
                              className="w-16 md:w-20 text-center border rounded bg-gray-900 text-white focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                              disabled={scores[category]?.[program]?.[team]?.published}
                              onWheel={(e) => e.target.blur()}
                            />
                          </td>
                        ))
                      )}
                    </tr>
                  ))}
                  <tr className="bg-gray-800 font-bold text-blue-300">
                    <td className="border p-3 text-sm sticky left-0 bg-gray-800 z-10">
                      Subtotal ({category})
                    </td>
                    {teams.map((team) => (
                      <td
                        key={`${category}-${team}-subtotal`}
                        colSpan={fields.length}
                        className="border p-3 text-center text-sm"
                      >
                        {sectionTotals[category][team]}
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-blue-800 to-blue-600 font-bold text-lg text-white">
                <td className="border p-3 sticky left-0 bg-blue-800 z-10">
                  🏆 Grand Total
                </td>
                {teams.map((team) => (
                  <td
                    key={`${team}-grandtotal`}
                    className="border p-3 text-center"
                    colSpan={fields.length}
                  >
                    {grandTotals[team]}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
