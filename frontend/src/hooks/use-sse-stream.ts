import { useState, useCallback } from "react";
import toast from "react-hot-toast";

export interface Message {
  role: "user" | "assistant";
  content: string;
  products?: any[]; 
}

export function useSSEStream() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (query: string) => {
      setIsLoading(true);

      setMessages((prev) => [
        ...prev,
        { role: "user", content: query },
        { role: "assistant", content: "" }, 
      ]);

      try {
        const response = await fetch(
          "http://localhost:8000/api/v1/chat/stream",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: query, 
            }),
          }
        );

        // 🚨 INTERCEPT ERRORS AND SHOW TOASTS
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("AI Speed Limit Exceeded. Please wait 60 seconds.");
          }
          throw new Error(`Server Error: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error("No readable stream available");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        
        let done = false;
        let buffer = ""; 

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          if (value) {
            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split("\n\n");
            buffer = parts.pop() || "";

            for (const part of parts) {
              let eventType = "message";
              let dataPayload = "";

              const lines = part.split("\n");
              for (const line of lines) {
                if (line.startsWith("event: ")) {
                  eventType = line.slice(7).trim();
                } else if (line.startsWith("data: ")) {
                  dataPayload = line.slice(6);
                }
              }

              if (dataPayload === "[DONE]") {
                done = true;
                break;
              }

              if (eventType === "products" && dataPayload) {
                try {
                  const parsedProducts = JSON.parse(dataPayload);
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1].products = parsedProducts;
                    return updated;
                  });
                } catch (e) {
                  console.error("Failed to parse product JSON", e);
                }
              } else if (eventType === "message" && dataPayload) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const cleanData = dataPayload.replace(/\\n/g, '\n');
                  updated[updated.length - 1].content += cleanData;
                  return updated;
                });
              }
            }
          }
        }
      } catch (error: any) {
        console.error("Streaming error:", error);
        
        // Fire the toast notification
        toast.error(error.message || "Failed to connect to AI");
        
        // 🚨 FIX: Only delete the chat bubble if it is COMPLETELY empty.
        // If it already has product cards, leave them on the screen!
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (!lastMessage.content && !lastMessage.products) {
            return prev.slice(0, -1);
          }
          return prev;
        });
        
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    messages,
    isLoading,
    sendMessage,
  };
}