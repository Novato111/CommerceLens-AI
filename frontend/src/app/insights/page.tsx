"use client";

import { useState } from "react";

export default function InsightsPage() {
  const [productId, setProductId] = useState("PROD-003");
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:8000/api/v1/products/${productId}/insights`);
      if (!res.ok) throw new Error("Analysis failed");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Review Intelligence</h1>
          <p className="text-gray-500">AI-powered sentiment analysis across thousands of customer reviews.</p>
        </header>

        {/* Input Control */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex gap-4 items-end max-w-xl mx-auto">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Product ID</label>
            <input 
              value={productId} 
              onChange={(e) => setProductId(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={isLoading}
            className="bg-black text-white px-8 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors h-[42px]"
          >
            {isLoading ? "Analyzing..." : "Generate Insights"}
          </button>
        </div>

        {error && <div className="text-red-600 text-center bg-red-50 p-4 rounded-lg">{error}</div>}

        {/* Results Dashboard */}
        {data && !data.insights.error && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Header Cards */}
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-center">
                <h2 className="text-2xl font-bold">{data.product_name}</h2>
                <p className="text-gray-500 mt-1">Based on {data.review_count} verified reviews</p>
              </div>
              <div className={`p-6 rounded-3xl shadow-sm border flex flex-col justify-center items-center text-center
                ${data.insights.overall_sentiment === 'Positive' ? 'bg-green-50 border-green-200 text-green-800' : 
                  data.insights.overall_sentiment === 'Negative' ? 'bg-red-50 border-red-200 text-red-800' : 
                  'bg-yellow-50 border-yellow-200 text-yellow-800'}`}
              >
                <div className="text-sm uppercase tracking-wider font-bold opacity-70 mb-1">Sentiment</div>
                <div className="text-3xl font-black">{data.insights.score_out_of_10} <span className="text-lg font-medium opacity-60">/ 10</span></div>
              </div>
            </div>

            {/* Pros and Cons */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                  <span className="text-green-500">👍</span> Top Praises
                </h3>
                <ul className="space-y-3">
                  {data.insights.top_praises.map((item: string, i: number) => (
                    <li key={i} className="text-gray-600 border-b border-gray-50 pb-2 last:border-0">{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                  <span className="text-red-500">⚠️</span> Dealbreakers
                </h3>
                <ul className="space-y-3">
                  {data.insights.dealbreakers.map((item: string, i: number) => (
                    <li key={i} className="text-gray-600 border-b border-gray-50 pb-2 last:border-0">{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* AI Advice */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 rounded-3xl shadow-lg">
              <div className="text-sm uppercase tracking-wider font-bold opacity-50 mb-2">Buyer Advice</div>
              <p className="text-xl font-medium leading-relaxed">{data.insights.buyer_advice}</p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}