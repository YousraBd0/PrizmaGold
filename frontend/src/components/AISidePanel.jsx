import React from "react";
import styles from "../styles/StudioPage.module.css";
import ChatBubble from "./ChatBubble";
import InputBar from "./InputBar";

const AISidePanel = () => {
  return (
    <section
      className={styles.aiPanel}
    >
      <div className={styles.aiOverlay}>
        <h2 className={styles.aiTitle}>What’s on your mind!</h2>

        <div className={styles.chatArea}>
          <ChatBubble>
            AI Model to generate your ideas into reality, with high quality
            images and. We understand your imagination.
          </ChatBubble>

          <ChatBubble>
            Describe your masterpiece (e.g. "Modern rose gold ring with a
            floating pear-cut emerald")
          </ChatBubble>
        </div>

        <InputBar />
      </div>
    </section>
  );
};

export default AISidePanel;
