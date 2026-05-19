"use client";

import { useState } from "react";

export default function EvaluationPage() {
  const [query, setQuery] = useState("Why should I buy a laptop with an OLED screen?");
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRunTest = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/api/v1/evaluation/run-ab-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error("Failed to run evaluation");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render the LCS Diff
  const renderDiff = (diffArray: any[]) => {
    return diffArray.map((part, idx) => {
      if (part.type === "add") {
        return <span key={idx} className="bg-green-100 text-green-800 px-1 rounded mx-0.5">{part.text}</span>;
      }
      if (part.type === "remove") {
        return <span key={idx} className="bg-red-100 text-red-800 line-through px-1 rounded mx-0.5">{part.text}</span>;
      }
      return <span key={idx} className="text-gray-700">{part.text}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-3xl font-bold">AI Evaluation & A/B Testing</h1>
          <p className="text-gray-500">Benchmark latency, token usage, and text diffs across prompts.</p>
        </header>

        {/* Input Controls */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex gap-4 items-end">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Test Query</label>
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button 
            onClick={handleRunTest}
            disabled={isLoading}
            className="bg-black text-white px-8 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors h-[42px]"
          >
            {isLoading ? "Running Benchmarks..." : "Run A/B Test"}
          </button>
        </div>

        {error && <div className="text-red-600 text-center bg-red-50 p-4 rounded-lg">{error}</div>}

        {/* Results Rendering */}
        {data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Side-by-Side Metrics */}
            <div className="grid grid-cols-2 gap-8">
              {/* Run A */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="text-lg font-bold">Prompt A: Strict</h3>
                    <p className="text-sm text-gray-500">{data.run_a.model}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-600 font-bold">{data.run_a.latency_seconds}s</div>
                    <div className="text-sm text-gray-500">{data.run_a.token_count} tokens</div>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{data.run_a.text}</p>
              </div>

              {/* Run B */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="text-lg font-bold">Prompt B: Creative</h3>
                    <p className="text-sm text-gray-500">{data.run_b.model}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-purple-600 font-bold">{data.run_b.latency_seconds}s</div>
                    <div className="text-sm text-gray-500">{data.run_b.token_count} tokens</div>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{data.run_b.text}</p>
              </div>
            </div>

            {/* Token-Level Diff Visualization */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
              <h4 className="font-bold text-xl mb-6 flex items-center gap-3">
                Longest Common Subsequence (LCS) Diff
                <span className="text-xs font-normal bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  A → B
                </span>
              </h4>
              <div className="leading-loose text-lg font-mono bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-inner">
                {renderDiff(data.diff)}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}