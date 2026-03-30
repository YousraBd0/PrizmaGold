import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/StudioPage.module.css";
import ChatBubble from "./ChatBubble";
import InputBar from "./InputBar";

const INITIAL_MESSAGES = [
  { role: "ai", text: "Welcome to PrizmaGold Studio ✦ I can turn your imagination into a bespoke jewellery design." },
  { role: "ai", text: 'Describe your masterpiece — e.g. "Modern rose gold ring with a floating pear-cut emerald" — and I\'ll generate a 3D preview.' },
];

const AI_REPLIES = [
  "Your design has been generated! Rotate the 3D preview on the left and switch metal finishes to compare options.",
  "Beautiful choice ✦ I've applied the stone and setting. Adjust the metal finish below the viewer to explore variations.",
  "Your bespoke piece is ready for preview. Measurements and estimated cost have been updated to reflect your specifications.",
];

const AISidePanel = ({ onDesignUpdate }) => {
  const [messages,   setMessages]   = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isLoading,  setIsLoading]  = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const prompt = inputValue.trim();
    if (!prompt || isLoading) return;

    setInputValue("");
    setMessages(prev => [
      ...prev,
      { role: "user", text: prompt },
      { role: "ai",  text: "",     isTyping: true },
    ]);
    setIsLoading(true);

    setTimeout(() => {
      onDesignUpdate?.(prompt);
      const reply = AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)];
      setMessages(prev => [...prev.slice(0, -1), { role: "ai", text: reply }]);
      setIsLoading(false);
    }, 1800);
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
            <ChatBubble key={i} role={msg.role} isTyping={msg.isTyping}>
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
