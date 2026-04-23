import React from "react";
import styles from "../styles/StudioPage.module.css";

const InputBar = ({ value, onChange, onSend, disabled }) => {
  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend?.();
    }
  };

  return (
    <div className={styles.inputBar}>
      <input
        type="text"
        placeholder="Describe your masterpiece"
        className={styles.inputField}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
      />
      <button
        className={styles.sendButton}
        aria-label="Send"
        onClick={onSend}
        disabled={disabled}
      >
        ✏️
      </button>
    </div>
  );
};

export default InputBar;
