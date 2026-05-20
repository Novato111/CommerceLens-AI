"use client";

import { useState, useRef, useEffect } from "react";
import { useSSEStream } from "@/hooks/use-sse-stream";
import { BrainCircuit, Scale, Zap, Sparkles, Send, ShoppingBag, LayoutDashboard, Settings } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export default function AgenticWorkspace() {
  const [input, setInput] = useState("");
  const { messages, isLoading, sendMessage } = useSSEStream();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeSheet, setActiveSheet] = useState<"none" | "compare" | "insights">("none");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [sheetData, setSheetData] = useState<any>(null);
  const [isSheetLoading, setIsSheetLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

 const openComparison = async (productId: string) => {
    const targetComparisonProduct = "PROD-001";
    setSelectedProduct(productId);
    setActiveSheet("compare");
    setIsSheetLoading(true);
    setSheetData(null); 

    try {
      const res = await fetch(`http://localhost:8000/api/v1/products/compare?id_a=${productId}&id_b=${targetComparisonProduct}`);
      if (!res.ok) {
        if (res.status === 429) throw new Error("Take a breath! Wait 60 seconds before comparing again.");
        throw new Error("Comparison engine failed to respond.");
      }
      const data = await res.json();
      setSheetData(data);
    } catch (err: any) {
      toast.error(err.message); // Pop the error!
      setActiveSheet("none"); // Close the sheet if it failed
    } finally {
      setIsSheetLoading(false);
    }
  };

  const openReviewInsights = async (productId: string) => {
    setSelectedProduct(productId);
    setActiveSheet("insights");
    setIsSheetLoading(true);
    setSheetData(null); 

    try {
      const res = await fetch(`http://localhost:8000/api/v1/products/${productId}/insights`);
      if (!res.ok) {
        if (res.status === 429) throw new Error("AI is cooling down. Try again in 60 seconds.");
        throw new Error("Insight engine failed to respond.");
      }
      const data = await res.json();
      setSheetData(data);
    } catch (err: any) {
      toast.error(err.message); // Pop the error!
      setActiveSheet("none"); // Close the sheet if it failed
    } finally {
      setIsSheetLoading(false);
    }
  };



  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      
      {/* 🚀 PREMIUM LEFT SIDEBAR */}
      <aside className="w-72 bg-slate-950 p-6 flex flex-col justify-between border-r border-slate-800 shadow-2xl z-20">
        <div className="space-y-8">
          <div className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Zap className="text-white w-5 h-5 fill-white" /> 
            </div>
            Commerce AI
          </div>
          <nav className="space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Workspace</div>
            
            <div className="px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl font-medium flex items-center gap-3 border border-blue-500/20 shadow-inner">
              <Sparkles className="w-4 h-4" /> AI Assistant
            </div>
            
            <div className="px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl font-medium flex items-center gap-3 cursor-pointer transition-colors">
              <ShoppingBag className="w-4 h-4" /> Order History
            </div>
            
            <div className="px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl font-medium flex items-center gap-3 cursor-pointer transition-colors">
              <Settings className="w-4 h-4" /> Settings
            </div>
          </nav>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-inner">A</div>
          <div>
            <div className="font-semibold text-white text-sm">Arjun Sharma</div>
            <div className="text-xs text-slate-400 font-medium">Pro Plan</div>
          </div>
        </div>
      </aside>

      {/* 💻 MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative">
        
        {/* Sleek Header */}
        <header className="px-8 py-6 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Perfect Products</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Powered by Gemini 2.0 Agentic Models</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> System Online
          </div>
        </header>

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-8">
          <div className="space-y-8 max-w-5xl mx-auto pb-4">
            
            {/* Welcome Message (Only shows if empty) */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[40vh] text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-2">
                  <BrainCircuit className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-700">How can I help you shop today?</h2>
                <p className="text-slate-500 max-w-md">Ask me to find laptops, compare specific models, or summarize reviews for products in our catalog.</p>
              </div>
            )}

            {/* Chat Bubbles */}
            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col gap-4 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Text Bubble */}
                {msg.content && (
                  <div className={`max-w-[80%] px-6 py-4 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-br-sm' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                )}

                {/* Rich Product Cards */}
                {msg.products && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full max-w-[95%]">
                    {msg.products.map((prod: any) => (
                      <Card key={prod.id} className="bg-white shadow-sm border-slate-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 group flex flex-col">
                        <CardHeader className="pb-3 bg-slate-50/50 border-b border-slate-100">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
                                {prod.name}
                              </CardTitle>
                              <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-sm font-semibold border border-blue-100">
                                ${prod.price}
                              </div>
                            </div>
                            <div className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold whitespace-nowrap shadow-sm">
                              Match
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-4 flex-1">
                          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                            {prod.description}
                          </p>
                        </CardContent>
                        
                        <CardFooter className="grid grid-cols-2 gap-3 p-4 bg-white border-t border-slate-100 mt-auto">
                          <Button 
                            variant="outline" 
                            className="w-full gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-700 font-medium" 
                            onClick={() => openComparison(prod.id)}
                          >
                            <Scale className="w-4 h-4 text-blue-500" /> Compare
                          </Button>
                          <Button 
                            variant="secondary" 
                            className="w-full gap-2 bg-slate-100 text-slate-900 hover:bg-slate-200 font-medium" 
                            onClick={() => openReviewInsights(prod.id)}
                          >
                            <BrainCircuit className="w-4 h-4 text-purple-500" /> Insights
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Box */}
        <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI to find, compare, or analyze products..."
              disabled={isLoading}
              className="flex-1 bg-slate-50 border-slate-200 h-14 pl-6 pr-16 rounded-2xl shadow-inner text-base focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:border-transparent transition-all"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input.trim()} 
              className="absolute right-2 h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </form>
          <div className="text-center mt-3 text-xs font-medium text-slate-400">
            Agentic AI can make mistakes. Verify important specifications.
          </div>
        </div>
      </main>

      {/* 🚀 SAFE & SOLID SLIDE-OUT SHEET */}
      {/* We explicitly set bg-white so it doesn't become a transparent blur-mess */}
      <Sheet open={activeSheet !== "none"} onOpenChange={(open) => !open && setActiveSheet("none")}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto bg-white border-l border-slate-200 shadow-2xl p-0">
          
          <div className="bg-slate-50 p-6 border-b border-slate-200">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
                {activeSheet === "compare" 
                  ? <><div className="p-2 bg-blue-100 rounded-lg"><Scale className="text-blue-600 w-5 h-5" /></div> Spec Comparison</> 
                  : <><div className="p-2 bg-purple-100 rounded-lg"><BrainCircuit className="text-purple-600 w-5 h-5" /></div> Review Intelligence</>}
              </SheetTitle>
              <SheetDescription className="text-slate-500 font-medium mt-2">
                {activeSheet === "compare" ? "Deep AI analysis of specifications and features." : "Sentiment analysis synthesized from verified customer reviews."}
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="p-6">
            {isSheetLoading ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                    <Zap className="w-8 h-8 animate-bounce text-blue-500 relative" /> 
                  </div>
                  <span className="font-medium animate-pulse">Generative AI is analyzing...</span>
              </div>
            ) : sheetData && (
              <div className="space-y-6">
                  
                  {/* COMPARISON CONTENT */}
                  {activeSheet === "compare" && sheetData.ai_analysis && (
                      <div className="space-y-6">
                          <div className="bg-slate-950 text-white p-6 rounded-2xl shadow-xl overflow-hidden relative">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                              <h5 className="font-bold text-slate-400 text-sm uppercase tracking-wider mb-2">Final Verdict</h5>
                              <div className="text-2xl font-black text-white mb-3 tracking-tight">{sheetData.ai_analysis.winner || "Pending"}</div>
                              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                {sheetData.ai_analysis.verdict || "Waiting for AI analysis..."}
                              </p>
                          </div>

                          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                              <h5 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" /> Key Differences
                              </h5>
                              <ul className="space-y-3">
                                  {sheetData.ai_analysis.key_differences?.map((d: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                                      <div className="mt-1 min-w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                      <span className="leading-relaxed">{d}</span>
                                    </li>
                                  ))}
                              </ul>
                          </div>
                      </div>
                  )}

                  {/* INSIGHTS CONTENT */}
                  {activeSheet === "insights" && sheetData.insights && (
                      <div className="space-y-6">
                          <div className="flex justify-between items-center p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200 shadow-inner">
                              <h5 className="font-bold text-slate-900 text-lg leading-tight w-2/3">{sheetData.product_name}</h5>
                              <div className="text-center">
                                <div className="font-black text-4xl text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-pink-600">
                                  {sheetData.insights.score_out_of_10 || "?"}<span className="text-2xl text-slate-400">/10</span>
                                </div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">AI Score</div>
                              </div>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-4">
                              <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                                  <h6 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Top Praises
                                  </h6>
                                  <ul className="space-y-2">
                                    {sheetData.insights.top_praises?.map((p: string, i: number) => (
                                      <li key={i} className="text-sm text-emerald-900/80 font-medium flex gap-2"><span>+</span> {p}</li>
                                    ))}
                                  </ul>
                              </div>
                              <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100">
                                  <h6 className="font-bold text-rose-800 mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-rose-500"></div> Dealbreakers
                                  </h6>
                                  <ul className="space-y-2">
                                    {sheetData.insights.dealbreakers?.map((p: string, i: number) => (
                                      <li key={i} className="text-sm text-rose-900/80 font-medium flex gap-2"><span>-</span> {p}</li>
                                    ))}
                                  </ul>
                              </div>
                          </div>
                          
                          <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500 opacity-20 rounded-full blur-2xl -mr-4 -mt-4"></div>
                              <h6 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">Final Buyer Advice</h6>
                              <p className="font-medium text-sm leading-relaxed text-slate-200">
                                {sheetData.insights.buyer_advice}
                              </p>
                          </div>
                      </div>
                  )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}