import React, { useState } from "react";
import styles from "../styles/PriceEstimation.module.css";

const EstimationForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    clientName: "",
    quantity: 1,
    labour: "",
    taxes: "",
    benefits: "",
  });

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert inputs to numbers for the calculation engine
    onSubmit({
      ...form,
      quantity: Number(form.quantity),
      labour: Number(form.labour),
      taxes: Number(form.taxes),
      benefits: Number(form.benefits),
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.formTitle}>Estimation Details</h2>
      <p className={styles.formSubtitle}>
        Enter the production variables below to calculate the final price breakdown.
      </p>

      {/* Client Name */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Client Name</label>
        <input
          className={styles.input}
          type="text"
          placeholder="e.g. Sarah Johnson"
          value={form.clientName}
          onChange={set("clientName")}
          required
        />
      </div>

      {/* Quantity */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Quantity</label>
        <input
          className={styles.input}
          type="number"
          min="1"
          value={form.quantity}
          onChange={set("quantity")}
          required
        />
      </div>

      {/* Labour */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Labour Cost (Flat)</label>
        <input
          className={styles.input}
          type="number"
          step="0.01"
          placeholder="Enter amount in USD"
          value={form.labour}
          onChange={set("labour")}
          required
        />
      </div>

      {/* Taxes */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Taxes (%)</label>
        <input
          className={styles.input}
          type="number"
          step="0.01"
          placeholder="e.g. 15"
          value={form.taxes}
          onChange={set("taxes")}
          required
        />
      </div>

      {/* Benefits */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Benefits / Margin (%)</label>
        <input
          className={styles.input}
          type="number"
          step="0.01"
          placeholder="e.g. 25"
          value={form.benefits}
          onChange={set("benefits")}
          required
        />
      </div>

      <button type="submit" className={styles.submitBtn}>
        Calculate Estimate
      </button>
    </form>
  );
};

export default EstimationForm;