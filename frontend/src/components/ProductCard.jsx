import React, { useState } from "react";
import styles from "../styles/StudioPage.module.css";

/* ── 2D Image Viewer ── */
const DesignViewer = ({ imageUrl }) => {
  if (imageUrl) {
    return (
      <div className={styles.designViewerWrapper}>
        <img
          src={imageUrl}
          alt="AI Generated Design"
          className={styles.designImage}
        />
        <div className={styles.aiGeneratedBadge}>✦ AI Generated</div>
      </div>
    );
  }

  return (
    <div className={styles.designViewerWrapper}>
      <div className={styles.designPlaceholder}>
        <span className={styles.placeholderIcon}>💍</span>
        <span className={styles.placeholderText}>
          Describe your design to generate a preview
        </span>
      </div>
    </div>
  );
};

/* ── Main ProductCard Component ── */
const ProductCard = ({ specs, imageUrl, onConfirm }) => {
  return (
    <div className={styles.productCard}>
      <DesignViewer imageUrl={imageUrl} />

      {/* Confirm Design button appears only after image is generated */}
      {imageUrl && (
        <button
          className={styles.confirmBtn}
          onClick={onConfirm}
        >
          Confirm Design
        </button>
      )}
    </div>
  );
};

export default ProductCard;
