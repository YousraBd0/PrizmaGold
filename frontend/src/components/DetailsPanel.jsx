import React from "react";
import styles from "../styles/StudioPage.module.css";
import ProductCard from "./ProductCard";

const DetailsPanel = () => {
  return (
    <section className={styles.detailsPanel}>
      <button className={styles.backButton} aria-label="Go back">
        <span className={styles.backIcon}>←</span>
      </button>

      <h1 className={styles.detailsTitle}>Details</h1>

      <ProductCard />
    </section>
  );
};

export default DetailsPanel;
