"use client";

import { useState } from "react";

export default function ComparePage() {
  const [idA, setIdA] = useState("PROD-001");
  const [idB, setIdB] = useState("PROD-002");

  const [data, setData] = useState<any>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] = useState("");

  const handleCompare = async () => {
    setIsLoading(true);

    setError("");

    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/products/compare?id_a=${idA}&id_b=${idB}`
      );

      if (!res.ok) {
        throw new Error(
          "Failed to fetch comparison"
        );
      }

      const json = await res.json();

      setData(json);

    } catch (err: any) {

      setError(err.message);

    } finally {

      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 py-10 px-6">

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-zinc-900">
            Intelligent Comparison Engine
          </h1>

          <p className="text-zinc-600 mt-4 text-lg">
            AI-driven analysis of product
            specifications and reviews.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">

          <div className="flex flex-wrap items-end gap-4">

            {/* Product A */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Product A (ID)
              </label>

              <input
                value={idA}
                onChange={(e) =>
                  setIdA(e.target.value)
                }
                className="
                  border border-gray-300
                  rounded-lg
                  px-4 py-2
                  w-48
                "
              />
            </div>

            {/* VS */}
            <div className="text-2xl font-bold text-zinc-500">
              VS
            </div>

            {/* Product B */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Product B (ID)
              </label>

              <input
                value={idB}
                onChange={(e) =>
                  setIdB(e.target.value)
                }
                className="
                  border border-gray-300
                  rounded-lg
                  px-4 py-2
                  w-48
                "
              />
            </div>

            {/* Button */}
            <button
              onClick={handleCompare}
              disabled={isLoading}
              className="
                bg-black
                text-white
                px-6 py-3
                rounded-xl
                font-medium
                hover:opacity-90
                disabled:opacity-50
              "
            >
              {isLoading
                ? "Analyzing..."
                : "Compare"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="
            bg-red-100
            text-red-700
            p-4
            rounded-xl
            mb-6
          ">
            {error}
          </div>
        )}

        {/* Results */}
        {data && (
          <div className="space-y-8">

            {/* Verdict */}
            <div className="
              bg-white
              rounded-2xl
              shadow-sm
              p-8
            ">
              <h2 className="
                text-2xl
                font-bold
                mb-4
              ">
                AI Verdict
              </h2>

              <div className="
                text-3xl
                font-semibold
                text-green-600
                mb-4
              ">
                {data.ai_analysis.winner}
              </div>

              <p className="
                text-zinc-700
                text-lg
              ">
                {data.ai_analysis.verdict}
              </p>
            </div>

            {/* Product Comparison */}
            <div className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-6
            ">

              {/* Product A */}
              <div className="
                bg-white
                rounded-2xl
                shadow-sm
                p-6
              ">
                <h3 className="
                  text-2xl
                  font-bold
                  mb-2
                ">
                  {data.product_a.name}
                </h3>

                <div className="
                  text-xl
                  text-zinc-600
                  mb-6
                ">
                  ${data.product_a.price}
                </div>

                <h4 className="
                  font-semibold
                  mb-3
                ">
                  Key Advantages
                </h4>

                <ul className="space-y-2">
                  {data.ai_analysis.product_a_pros.map(
                    (
                      pro: string,
                      i: number
                    ) => (
                      <li
                        key={i}
                        className="
                          flex items-start gap-2
                        "
                      >
                        <span>
                          ✓
                        </span>

                        <span>
                          {pro}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Product B */}
              <div className="
                bg-white
                rounded-2xl
                shadow-sm
                p-6
              ">
                <h3 className="
                  text-2xl
                  font-bold
                  mb-2
                ">
                  {data.product_b.name}
                </h3>

                <div className="
                  text-xl
                  text-zinc-600
                  mb-6
                ">
                  ${data.product_b.price}
                </div>

                <h4 className="
                  font-semibold
                  mb-3
                ">
                  Key Advantages
                </h4>

                <ul className="space-y-2">
                  {data.ai_analysis.product_b_pros.map(
                    (
                      pro: string,
                      i: number
                    ) => (
                      <li
                        key={i}
                        className="
                          flex items-start gap-2
                        "
                      >
                        <span>
                          ✓
                        </span>

                        <span>
                          {pro}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>

            {/* Key Differences */}
            <div className="
              bg-white
              rounded-2xl
              shadow-sm
              p-8
            ">
              <h2 className="
                text-2xl
                font-bold
                mb-4
              ">
                Key Differences
              </h2>

              <ul className="space-y-3">
                {data.ai_analysis.key_differences.map(
                  (
                    diff: string,
                    i: number
                  ) => (
                    <li
                      key={i}
                      className="
                        border-b
                        border-zinc-200
                        pb-3
                      "
                    >
                      {diff}
                    </li>
                  )
                )}
              </ul>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}