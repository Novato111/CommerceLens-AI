import { useState, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function useSSEStream() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (query: string) => {
      setIsLoading(true);

      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: query,
        },
      ]);

      // Create empty assistant message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
        },
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
              query,
            }),
          }
        );

        if (!response.body) {
          throw new Error(
            "No readable stream available"
          );
        }

        const reader =
          response.body.getReader();

        const decoder = new TextDecoder(
          "utf-8"
        );

        let done = false;

        while (!done) {
          const {
            value,
            done: readerDone,
          } = await reader.read();

          done = readerDone;

          if (value) {
            const chunk = decoder.decode(
              value,
              { stream: true }
            );

            // Parse SSE
            const lines =
              chunk.split("\n");

            for (const line of lines) {
              if (
                line.startsWith("data: ")
              ) {
                const data =
                  line.slice(6);

                // End stream
                if (data === "[DONE]") {
                  done = true;
                  break;
                }

                // Append streamed text
                setMessages((prev) => {
                  const updated = [...prev];

                  const lastIndex =
                    updated.length - 1;

                  updated[lastIndex].content +=
                    data;

                  return updated;
                });
              }
            }
          }
        }
      } catch (error) {
        console.error(
          "Streaming error:",
          error
        );
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