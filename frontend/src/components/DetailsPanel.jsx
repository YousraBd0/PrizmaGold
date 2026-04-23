import React from "react";
import styles from "../styles/StudioPage.module.css";
import ProductCard from "./ProductCard";

const DetailsPanel = ({ activeMetal, setActiveMetal, specs, modelUrl }) => {
  return (
    <section className={styles.detailsPanel}>
      <button className={styles.backButton} aria-label="Go back">
        <span className={styles.backIcon}>←</span>
      </button>

      <h1 className={styles.detailsTitle}>Details</h1>

      <ProductCard
        activeMetal={activeMetal}
        setActiveMetal={setActiveMetal}
        specs={specs}
        modelUrl={modelUrl}
      />
    </section>
  );
};

export default DetailsPanel;
