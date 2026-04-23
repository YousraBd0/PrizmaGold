import React, { useState } from "react";
import EstimationForm   from "./EstimationForm";
import EstimationResult from "./EstimationResult";
import styles from "../styles/PriceEstimation.module.css";
 
// ─────────────────────────────────────────────────────────────────
//  MOCK SWITCH
//  Set to false when Spring Boot /api/estimate is ready
// ─────────────────────────────────────────────────────────────────
const USE_MOCK = true;
 
// ─────────────────────────────────────────────────────────────────
//  MOCK ESTIMATOR
//  Simulates what the backend will calculate using:
//    - specs  (from Module 1 — metal, stone, weight)
//    - formData (from the EstimationForm)
//    - a fake live gold price (Module 2 placeholder)
//
//  Returns the exact shape EstimationResult expects:
//  {
//    materialCost, laborCost, urgencySurcharge, finishSurcharge,
//    engravingCost, totalCost, goldPriceUsed, currency,
//    quantity, totalForQuantity
//  }
// ─────────────────────────────────────────────────────────────────
 
// Fake live gold price — Module 2 will supply this for real
const MOCK_GOLD_PRICE_PER_OZ = 2345.10;
 
// Cost per gram by metal type (rough market approximation)
const METAL_COST_PER_GRAM = {
  "18k gold":   58.0,
  "rose gold":  55.0,
  "silver 925":  0.9,
  "platinum":  32.0,
  default:      58.0,
};
 
// Stone base costs (flat addition)
const STONE_BASE_COST = {
  "diamond":       800,
  "ruby":          350,
  "sapphire":      300,
  "green emerald": 250,
  "pearl":         120,
  "opal":          100,
  default:         150,
};
 
const URGENCY_SURCHARGE = { standard: 0, express: 0.15, urgent: 0.30 };
const FINISH_SURCHARGE  = { polished: 0, matte: 0.05, brushed: 0.05, hammered: 0.08 };
const ENGRAVING_COST    = 45;
const LABOR_RATE        = 0.35; // labor = 35% of material cost
 
function fmt(n) {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " $";
}
 
function mockEstimate(specs, formData) {
  const metalKey  = (specs.metal  || "18k gold").toLowerCase();
  const stoneKey  = (specs.stone  || "").toLowerCase();
  const weightVal = parseFloat(specs.weight) || 3.5;
  const qty       = parseInt(formData.quantity) || 1;
 
  // Material cost = weight × cost-per-gram for that metal + stone cost
  const costPerGram  = METAL_COST_PER_GRAM[metalKey]  ?? METAL_COST_PER_GRAM.default;
  const stoneCost    = STONE_BASE_COST[stoneKey]       ?? STONE_BASE_COST.default;
  const materialCost = weightVal * costPerGram + stoneCost;
 
  // Labor
  const laborCost = materialCost * LABOR_RATE;
 
  // Subtotal before surcharges
  const subtotal = materialCost + laborCost;
 
  // Surcharges
  const urgencyRate  = URGENCY_SURCHARGE[formData.urgency]  ?? 0;
  const finishRate   = FINISH_SURCHARGE[formData.finish]    ?? 0;
  const urgencyAmt   = subtotal * urgencyRate;
  const finishAmt    = subtotal * finishRate;
 
  // Engraving
  const engravingAmt = formData.engravingText?.trim() ? ENGRAVING_COST : 0;
 
  // Total per unit
  const totalUnit = subtotal + urgencyAmt + finishAmt + engravingAmt;
 
  return {
    materialCost:     fmt(materialCost),
    laborCost:        fmt(laborCost),
    urgencySurcharge: urgencyAmt > 0 ? fmt(urgencyAmt) : "—",
    finishSurcharge:  finishAmt  > 0 ? fmt(finishAmt)  : "—",
    engravingCost:    engravingAmt > 0 ? fmt(engravingAmt) : null,
    totalCost:        fmt(totalUnit),
    goldPriceUsed:    MOCK_GOLD_PRICE_PER_OZ.toFixed(2),
    currency:         "USD",
    quantity:         qty,
    totalForQuantity: qty > 1 ? fmt(totalUnit * qty) : null,
  };
}
 
// ─────────────────────────────────────────────────────────────────
 
const PriceEstimationPage = ({ confirmedDesign, onBack }) => {
  const [result,    setResult]    = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);
 
  const { specs, imageUrl } = confirmedDesign;
 
  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
 
    try {
      let data;
 
      if (USE_MOCK) {
        // ── MOCK PATH: simulate calculation delay ──
        await new Promise(resolve => setTimeout(resolve, 1200));
        data = mockEstimate(specs, formData);
      } else {
        // ── REAL PATH: call Spring Boot backend ──
        const res = await fetch("http://localhost:8080/api/estimate", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ specs, formData }),
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        data = await res.json();
      }
 
      setResult(data);
    } catch (err) {
      setError("Could not reach the server. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };
 
  return (
    <div className={styles.pageRoot}>
 
      {/* ── Left panel: confirmed design preview ── */}
      <div className={styles.previewPanel}>
        <button className={styles.backBtn} onClick={onBack}>Back to Studio</button>
 
        <div className={styles.previewImageWrapper}>
          {imageUrl ? (
            <img src={imageUrl} alt="Confirmed Design" className={styles.previewImage} />
          ) : (
            <div className={styles.previewPlaceholder}>💍</div>
          )}
          <div className={styles.confirmedBadge}>Confirmed Design</div>
        </div>
 
        <div className={styles.specsSummary}>
          <h3 className={styles.specsTitle}>Design Specifications</h3>
          <ul className={styles.specsList}>
            <li><span>Metal</span>        <span>{specs?.metal  || "—"}</span></li>
            <li><span>Stone</span>        <span>{specs?.stone  || "—"}</span></li>
            <li><span>Ring Size</span>    <span>{specs?.size   || "—"}</span></li>
            <li><span>Total Weight</span> <span>{specs?.weight || "—"}</span></li>
          </ul>
        </div>
 
        {/* Mock mode notice — remove once backend is live */}
        {USE_MOCK && (
          <div className={styles.mockNotice}>
             Mock Mode — using simulated gold price of ${MOCK_GOLD_PRICE_PER_OZ}/oz
          </div>
        )}
      </div>
 
      {/* ── Right panel: form or result ── */}
      <div className={styles.formPanel}>
        {error && <div className={styles.errorBanner}>⚠️ {error}</div>}
 
        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner} />
            <p>Calculating your estimate…</p>
          </div>
        ) : result ? (
          <EstimationResult
            result={result}
            specs={specs}
            imageUrl={imageUrl}
            onRecalculate={() => setResult(null)}
            onBack={onBack}
          />
        ) : (
          <EstimationForm onSubmit={handleFormSubmit} />
        )}
      </div>
    </div>
  );
};
 
export default PriceEstimationPage;