import React from "react";
import styles from "../styles/StudioPage.module.css";
import ProductCard from "./ProductCard";

const DetailsPanel = ({ activeMetal, setActiveMetal, specs, imageUrl, onConfirmDesign }) => {
  return (
    <section className={styles.detailsPanel}>


      <h1 className={styles.detailsTitle}>Details</h1>

      <ProductCard
        specs={specs}
        imageUrl={imageUrl}
        onConfirm={onConfirmDesign}
      />
    </section>
  );
};

export default DetailsPanel;
