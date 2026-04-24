import React, { useState } from "react";
import styles from "../styles/PriceEstimation.module.css";

const EstimationForm = ({ onSubmit, initialSpecs = {}, onFormChange }) => {
  const [form, setForm] = useState({
    clientName: "",
    quantity: 1,
    labour: "",
    taxes: "",
    benefits: "",
    karat: 18,
    weight: initialSpecs.weight ? parseFloat(initialSpecs.weight) : "",
    size: initialSpecs.size || "",
  });

  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (onFormChange) onFormChange(updated);
      return updated;
    });
  };

  // Initialize onFormChange with initial state on mount
  React.useEffect(() => {
    if (onFormChange) onFormChange(form);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert inputs to numbers for the calculation engine
    onSubmit({
      ...form,
      quantity: Number(form.quantity),
      labour: Number(form.labour),
      taxes: Number(form.taxes),
      benefits: Number(form.benefits),
      karat: Number(form.karat),
      weight: Number(form.weight),
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

      {/* Karat */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Karat of Gold</label>
        <input
          className={styles.input}
          type="number"
          step="0.1"
          placeholder="e.g. 18"
          value={form.karat}
          onChange={set("karat")}
          required
        />
      </div>

      {/* Weight */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Weight (grams)</label>
        <input
          className={styles.input}
          type="number"
          step="0.01"
          placeholder="e.g. 3.5"
          value={form.weight}
          onChange={set("weight")}
          required
        />
      </div>

      {/* Size - only display if it has an initial value (e.g. it's a ring) */}
      {initialSpecs.size && (
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Ring Size</label>
          <input
            className={styles.input}
            type="text"
            placeholder="e.g. 18"
            value={form.size}
            onChange={set("size")}
            required
          />
        </div>
      )}

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
        <label className={styles.label}>Taxes (USD)</label>
        <input
          className={styles.input}
          type="number"
          step="0.01"
          placeholder="Enter amount in USD"
          value={form.taxes}
          onChange={set("taxes")}
          required
        />
      </div>

      {/* Benefits */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Benefits / Margin (USD)</label>
        <input
          className={styles.input}
          type="number"
          step="0.01"
          placeholder="Enter amount in USD"
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