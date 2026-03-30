import React from "react";
import styles from "../styles/StudioPage.module.css";
import botIcon from "../assets/ChatBot Loader Animation.gif";

const ChatBubble = ({ children, role, isTyping }) => {
  const isUser = role === "user";

  if (isUser) {
    return (
      <div className={styles.chatBubbleRowUser}>
        <div className={`${styles.chatBubble} ${styles.chatBubbleUser}`}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatBubbleRow}>
      <div className={styles.chatAvatar}>
        <img src={botIcon} alt="AI bot" />
      </div>
      <div className={`${styles.chatBubble}${isTyping ? " " + styles.chatBubbleTyping : ""}`}>
        {isTyping
          ? <span className={styles.typingDots}><span /><span /><span /></span>
          : children}
      </div>
    </div>
  );
};

export default ChatBubble;
