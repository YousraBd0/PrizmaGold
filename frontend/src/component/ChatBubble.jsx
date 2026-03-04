import React from "react";
import styles from "../styles/StudioPage.module.css";
import botIcon from "../assets/ChatBot Loader Animation.gif";

const ChatBubble = ({ children }) => {
  return (
    <div className={styles.chatBubbleRow}>
      <div className={styles.chatAvatar}>
        <img src={botIcon} alt="AI bot" />
      </div>
      <div className={styles.chatBubble}>{children}</div>
    </div>
  );
};

export default ChatBubble;
