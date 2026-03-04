import React from "react";
import styles from "../styles/StudioPage.module.css";
import emeraldImg from "../assets/Bague.jpg";
import coinIcon from "../assets/download.jpg"; // use your dollar-coin asset

const ProductCard = () => {
  return (
  <>
    <div className={styles.productCard}>
      <h2 className={styles.productCardTitle}>
        Design selection: Emerald Ring
      </h2>

      <div className={styles.productImageWrapper}>
        <img
          src={emeraldImg}
          alt="Emerald ring design"
          className={styles.productImage}
        />
      </div>
    </div>

    <div className={styles.measurementDiv}>
        Measurement Breakdown
      </div>
      
      <ul className={styles.measurementsList}>
        <li>
          <span>Ring Size :</span> <span>20</span>
        </li>
        <li>
          <span>Metal :</span> <span>18k Gold</span>
        </li>
        <li>
          <span>Stone :</span> <span>Green Emerald</span>
        </li>
        <li>
          <span>Total Weight :</span> <span>3.2 g</span>
        </li>
      </ul>
     
    <div className={styles.costBox}>
        <div className={styles.costIconWrapper}>
          <img src={coinIcon} alt="Cost icon" />
        </div>
        <div className={styles.costText}>
          <span className={styles.costLabel}>Estimated Cost:</span>
          <span className={styles.costValue}>3,150.00 $</span>
        </div>
      </div>
    
  </>
  );
};

export default ProductCard;
