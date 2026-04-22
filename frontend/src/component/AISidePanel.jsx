import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/StudioPage.module.css";
import ChatBubble from "./ChatBubble";
import InputBar from "./InputBar";

const INITIAL_MESSAGES = [
  { role: "ai", text: "Welcome to PrizmaGold Studio ✦ I can turn your imagination into a bespoke jewellery design." },
  { role: "ai", text: 'Describe your masterpiece — e.g. "Modern rose gold ring with a floating pear-cut emerald" — and I\'ll generate a 3D preview.' },
];

const AISidePanel = ({ onDesignUpdate, currentSpecs }) => {
  const sessionId = useRef(crypto.randomUUID());
  const [messages,   setMessages]   = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isLoading,  setIsLoading]  = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const prompt = inputValue.trim();
    if (!prompt || isLoading) return;

    setInputValue("");
    setMessages(prev => [
      ...prev,
      { role: "user", text: prompt },
      { role: "ai",   text: "", isTyping: true },
    ]);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          sessionId: sessionId.current,
          history: messages.map(m => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.text,
          })),
          currentSpecs: currentSpecs,
        }),
      });

      const data = await res.json();

      // FIX 2 — detect image URL and store it separately
      const isImageUrl =
        data.reply?.startsWith("http") && data.reply?.includes("pollinations");

      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          role: "ai",
          text: isImageUrl ? "Here is your generated jewelry! ✨" : data.reply,
          imageUrl: isImageUrl ? data.reply : null,
        },
      ]);

      // FIX 3 — pass image URL as modelUrl to the 3D viewer
      onDesignUpdate?.(data.specs, data.reply);

    } catch (error) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: "ai", text: "Error connecting to server.", isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.aiPanel}>
      <div className={styles.aiOverlay}>
        <h2 className={styles.aiTitle}>What's on your mind!</h2>

        <div className={styles.statusBar}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>PrizmaGold AI · Design Studio</span>
        </div>

        <div className={styles.chatArea}>
          {messages.map((msg, i) => (
            // FIX 2 — pass imageUrl prop to ChatBubble
            <ChatBubble
              key={i}
              role={msg.role}
              isTyping={msg.isTyping}
              imageUrl={msg.imageUrl}
            >
              {msg.text}
            </ChatBubble>
          ))}
          <div ref={chatEndRef} />
        </div>

        <InputBar
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          disabled={isLoading}
        />
      </div>
    </section>
  );
};

export default AISidePanel;