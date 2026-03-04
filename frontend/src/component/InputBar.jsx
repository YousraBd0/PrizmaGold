import React from "react";
import styles from "../styles/StudioPage.module.css";

const InputBar = () => {
  return (
    <form className={styles.inputBar}>
      <input
        type="text"
        placeholder="Describe your masterpiece"
        className={styles.inputField}
      />
      <button type="submit" className={styles.sendButton} aria-label="Send">
        ✏️
      </button>
    </form>
  );
};

export default InputBar;
