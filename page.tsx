"use client";

import { useState } from "react";

export default function SummaryAgentPage() {
  const [sourceText, setSourceText] = useState("");
  const [summaryResult, setSummaryResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTriggerSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceText.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMsg("");
    setSummaryResult("");

    try {
      const response = await fetch("/api/summary-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textToSummarize: sourceText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to communicate with agent engine");
      }

      setSummaryResult(data.summary);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Branding */}
        <header className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold tracking-tight">LlamaIndex Summary Agent</h1>
          <p className="text-sm text-gray-500 mt-1">
            Leveraging agentic routing loops to analyze documentation context.
          </p>
        </header>

        {/* Core Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Panel */}
          <section className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm flex flex-col space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Source Documentation</h2>
            <form onSubmit={handleTriggerSummary} className="flex-1 flex flex-col space-y-4">
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste long-form documentation, system architecture notes, or text logs here..."
                className="w-full flex-1 min-h-[350px] p-3 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button
                type="submit"
                disabled={isLoading || !sourceText.trim()}
                className="w-full bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 py-3 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                {isLoading ? "Agent Orchestrating Reflection..." : "Compile Summary"}
              </button>
            </form>
          </section>

          {/* Output Execution Panel */}
          <section className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm flex flex-col space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Agent Synthesized Output</h2>
            
            <div className="flex-1 border border-gray-100 rounded-lg bg-gray-50 p-4 overflow-y-auto min-h-[350px] whitespace-pre-wrap text-sm leading-relaxed">
              {isLoading && (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              )}
              
              {errorMsg && (
                <div className="text-red-600 bg-red-50 p-3 rounded-md border border-red-100 font-mono text-xs">
                  {errorMsg}
                </div>
              )}

              {!isLoading && !summaryResult && !errorMsg && (
                <p className="text-gray-400 italic text-center mt-20">
                  Input data and execute the pipeline to initialize summary compilation.
                </p>
              )}

              {summaryResult && (
                <div className="prose prose-sm text-gray-800">
                  {summaryResult}
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
