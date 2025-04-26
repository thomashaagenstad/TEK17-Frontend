"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

type Message = {
  sender: "user" | "bot";
  text: string;
  source?: string;
};

export default function Home() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hei! Jeg kan svare på spørsmål om TEK17 kapittel 11 🔥", source: "" },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const askQuestion = async () => {
    if (!question.trim()) return;

    const userMessage = { sender: "user", text: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setIsTyping(true);

    try {
      const response = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      const botMessage = {
        sender: "bot",
        text: data.answer.result,
        source: data.answer.source || "",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Feil ved henting av svar:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="text-center py-6 border-b border-gray-700 sticky top-0 bg-gray-950 z-10">
        <h1 className="text-3xl font-bold">TEK17 Chatbot 🔥</h1>
      </header>

      {/* Meldinger */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-4 rounded-2xl max-w-[80%] ${
                msg.sender === "user"
                  ? "bg-blue-600 self-end ml-auto"
                  : "bg-gray-800 self-start mr-auto"
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>
              {msg.sender === "bot" && msg.source && (
                <p className="text-sm text-gray-400 mt-2">Kilde: {msg.source}</p>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="p-4 rounded-2xl bg-gray-800 max-w-[80%] self-start mr-auto"
            >
              <p>TEK17 Chatbot skriver<span className="animate-pulse">...</span></p>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Inputfelt */}
      <footer className="p-4 border-t border-gray-700">
        <div className="flex max-w-2xl mx-auto gap-2">
          <Input
            className="flex-1 bg-gray-800 text-white placeholder-gray-400"
            placeholder="Still et spørsmål om TEK17 kapittel 11..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && askQuestion()}
          />
          <Button onClick={askQuestion}>Send</Button>
        </div>
      </footer>
    </div>
  );
}

