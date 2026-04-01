import React from "react";
import styles from "../styles/StudioPage.module.css";
import DetailsPanel from "./DetailsPanel";
import AISidePanel from "./AISidePanel";
import bgEmeraldSatin from "../assets/Gemini_Generated_Image.png";

const StudioPage = () => {
  return (
    <div
      className={styles.pageRoot}
      style={{ backgroundImage: `url(${bgEmeraldSatin})` }}
    >
      <div className={styles.mainWrapper}>
        <DetailsPanel />
        <AISidePanel />
      </div>
    </div>
  );
};

export default StudioPage;
