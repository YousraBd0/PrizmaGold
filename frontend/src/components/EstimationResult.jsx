import React from "react";
import styles from "../styles/PriceEstimation.module.css";

const EstimationResult = ({ result, specs, onRecalculate, onBack }) => {
  const rows = [
    { label: "Material Cost", value: result.materialCost },
    { label: "Labour Cost",   value: result.laborCost },
    { label: "Taxes",         value: result.taxAmount || "—" },
    { label: "Margin/Profit", value: result.benefitAmount || "—" },
  ];

  return (
    <div className={styles.result}>
      <h2 className={styles.formTitle}>Price Estimation</h2>
      <p className={styles.formSubtitle}>
        Calculated using live rate: <strong>{result.goldPriceUsed} {result.currency}/oz</strong>
      </p>

      <div className={styles.breakdown}>
        {rows.map(({ label, value }) => (
          <div key={label} className={styles.breakdownRow}>
            <span className={styles.breakdownLabel}>{label}</span>
            <span className={styles.breakdownValue}>{value}</span>
          </div>
        ))}

        <div className={styles.breakdownDivider} />

        <div className={`${styles.breakdownRow} ${styles.totalRow}`}>
          <span>Total (Per Unit)</span>
          <span>{result.totalCost}</span>
        </div>

        {result.quantity > 1 && (
          <div className={`${styles.breakdownRow} ${styles.totalRow}`}>
            <span>Total for {result.quantity} units</span>
            <span>{result.totalForQuantity}</span>
          </div>
        )}
      </div>

      <div className={styles.specsRecap}>
        <span>{specs?.metal}</span>
        <span className={styles.dot}>·</span>
        <span>{specs?.stone}</span>
        <span className={styles.dot}>·</span>
        <span>Size {specs?.size}</span>
      </div>

      <div className={styles.resultActions}>
        <button className={styles.secondaryBtn} onClick={onRecalculate}>Edit Rules</button>
        <button className={styles.secondaryBtn} onClick={onBack}> Back to Studio</button>
        <button className={styles.primaryBtn} onClick={() => window.print()}>Print Invoice</button>
      </div>
    </div>
  );
};

export default EstimationResult;