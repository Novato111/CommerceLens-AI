"use client";

import { useState, useRef, useEffect } from "react";
import { useSSEStream } from "@/hooks/use-sse-stream";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const { messages, isLoading, sendMessage } = useSSEStream();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom as the stream types out
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      <header className="py-4 px-6 bg-white border-b border-gray-200 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight">Commerce Intelligence</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <h2 className="text-2xl font-semibold mb-2">How can I help you shop today?</h2>
            <p>Ask about products, comparisons, or recommendations.</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-2xl rounded-2xl px-5 py-3 ${
              msg.role === "user" 
                ? "bg-blue-600 text-white" 
                : "bg-white border border-gray-200 shadow-sm"
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Find me a gaming laptop under $1000..."
            className="flex-1 rounded-full border border-gray-300 px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}

