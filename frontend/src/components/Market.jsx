import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMetalPrice } from "../hooks/useMetalPrice";
import { useAiForecast } from "../hooks/useAiForecast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  Cell,
  LabelList,
} from "recharts";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  gold: "#E8B40D",
  goldLight: "#f0c840",
  advisory: "#F0F7ED",
  cardBorder: "#89BE9F",
  darkGreen: "#102C1D", // écriture STRONG BUY = vert sidebar
};

// Dynamic Data fetched from backend using useMetalPrice

// ── Tooltip ───────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(13,34,16,0.97)",
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 10,
        padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          color: "rgba(255,255,255,0.45)",
          fontSize: 11,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: C.gold, fontSize: 13, fontWeight: 700 }}>
          {p.name === "gold" ? "🥇" : "🥈"} ${p.value.toLocaleString()}
        </div>
      ))}
    </div>
  );
};

// ── Gauge ─────────────────────────────────────────────────────────────────────
function SentimentGauge({ signal }) {
  let rotation = 0;
  const s = signal.toUpperCase();
  if (s.includes("STRONG BUY")) rotation = 58;
  else if (s.includes("BUY")) rotation = 28;
  else if (s.includes("STRONG SELL")) rotation = -58;
  else if (s.includes("SELL")) rotation = -28;
  else rotation = 0; // Neutral / Hold

  return (
    <div
      style={{
        position: "relative",
        width: 200,
        height: 115,
        margin: "0 auto",
      }}
    >
      <svg width="200" height="115" viewBox="0 0 200 115">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#E8B40D" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <filter id="needleGlow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer track */}
        <path
          d="M 18 100 A 82 82 0 0 1 182 100"
          fill="none"
          stroke="rgba(137,190,159,0.25)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Gradient color arc */}
        <path
          d="M 18 100 A 82 82 0 0 1 182 100"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Needle pointing dynamically (styled like a clock hand) */}
        <motion.g
          style={{ transformOrigin: "100px 100px" }}
          initial={{ rotate: -85 }}
          animate={{ rotate: rotation }}
          transition={{
            duration: 1.6,
            ease: [0.34, 1.56, 0.64, 1],
            delay: 0.4,
          }}
          filter="url(#needleGlow)"
        >
          {/* Main needle body */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="34"
            stroke="#666"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Arrow tip (thinner) */}
          <path
            d="M 100 26 L 97 36 L 103 36 Z"
            fill="#666"
          />
        </motion.g>
        {/* Pivot */}
        <circle cx="100" cy="100" r="7" fill="#E8B40D" />
        <circle cx="100" cy="100" r="3.5" fill="#F0F7ED" />
      </svg>
    </div>
  );
}

// ── Inner card ────────────────────────────────────────────────────────────────
const innerCard = {
  background: "#fff",
  borderRadius: 16,
  padding: "22px 24px",
  boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
  border: `1.5px solid ${C.cardBorder}`,
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Market() {
  const [activeAsset, setActiveAsset] = useState("gold");
  const [animatedConf, setAnimatedConf] = useState(0);

  const { aiForecast, loading: aiLoading, error: aiError } = useAiForecast();
  const { prices, loading, error, fetchLiveOnly } = useMetalPrice();

  const [livePrice, setLivePrice] = useState(null);

  const handleFetchLive = async () => {
    // fetchNewPrice enregistre en DB et rafraîchit la liste complète
    await fetchNewPrice();
  };

  const currentForecast = aiForecast || {
    signal: "NEUTRAL",
    score: 0,
    current_price: 0,
    target_price: 0,
    prophet_change: 0,
    reasons: [],
    forecastData: []
  };

  // ── MARKET STATUS LOGIC ──
  const now = new Date();
  const day = now.getDay(); // 0 = Dimanche, 6 = Samedi
  const isWeekend = (day === 0 || day === 6);
  const marketStatus = isWeekend ? "CLOSED" : "OPEN";

  // Use the latest price from the API if available. Otherwise, fallback.
  const rawPrice = livePrice || (prices && prices.length > 0
    ? prices[0].price_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "4,829.31");

  const displayPrice = isWeekend ? rawPrice : rawPrice;
  const priceLabel = isWeekend ? "Friday Close" : "Live Price";


  useEffect(() => {
    if (!aiLoading && currentForecast.score) {
      const target = currentForecast.score;
      let v = 0;
      const iv = setInterval(() => {
        v += 1.4;
        if (v >= target) {
          setAnimatedConf(target);
          clearInterval(iv);
        } else setAnimatedConf(parseFloat(v.toFixed(1)));
      }, 18);
      return () => clearInterval(iv);
    }
  }, [aiLoading, currentForecast.score]);

  const displayData = prices && prices.length > 0
    ? (() => {
      const grouped = {};
      [...prices].reverse().forEach((p) => {
        const d = new Date(p.recorded_at);
        // On crée une clé par jour (YYYY-MM-DD)
        const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

        // On privilégie le point de 9h si possible, sinon le dernier point du jour
        const hour = d.getHours();
        // On prend le point s'il n'existe pas encore pour ce jour, 
        // ou si c'est celui de 9h (notre référence), 
        // ou si ce point est plus récent que celui déjà stocké.
        if (!grouped[dateStr] || hour === 9 || d > grouped[dateStr].rawDate) {
          grouped[dateStr] = {
            time: dateStr,
            rawDate: d,
        gold: p.price_usd,
            value: activeAsset === "gold" ? p.price_usd : p.price_usd * 0.012
          };
        }
      });
      const result = [];
      const today = new Date();
      
      // On parcourt les 10 derniers jours calendaires
      for (let i = 9; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        
        if (grouped[dateStr]) {
          result.push(grouped[dateStr]);
        } else {
          // Si trou de donnée (week-end), on répète le dernier prix connu
          const lastVal = result.length > 0 ? result[result.length - 1].gold : 4829.31;
          result.push({
            time: dateStr,
            gold: lastVal,
            value: activeAsset === "gold" ? lastVal : lastVal * 0.012,
            isInterpolated: true
          });
        }
      }
      return result;
    })()
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 22,
        padding: "30px 34px",
        height: "100%",
        overflowY: "auto",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <motion.h1
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: "#1a1a1a",
              fontFamily: "'Cinzel', serif",
              margin: 0,
            }}
          >
            Market Intel
          </motion.h1>

          {/* BADGE STATUT DU MARCHÉ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "10px",
              fontWeight: "800",
              letterSpacing: "0.5px",
              backgroundColor: isWeekend ? "#fee2e2" : "#dcfce7",
              color: isWeekend ? "#dc2626" : "#166534",
              border: `1px solid ${isWeekend ? "#fecaca" : "#bbf7d0"}`,
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginTop: 2
            }}
          >
            <div style={{ 
              width: 6, 
              height: 6, 
              borderRadius: "50%", 
              backgroundColor: isWeekend ? "#dc2626" : "#22c55e" 
            }} />
            MARKET {marketStatus}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            padding: "8px 18px",
            background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
            borderRadius: 50,
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.1em",
            boxShadow: `0 2px 10px rgba(232,180,13,0.35)`,
          }}
        >
          GOLD (XAU) ONLY
        </motion.div>
      </div>

      {/* ── Grid ── */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}
      >
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Live chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ ...innerCard, padding: "26px 28px 18px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 22,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif",
                    color: "#111",
                  }}
                >
                  Live Price Movement
                </h2>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 5,
                  }}
                >
                  <button
                    onClick={handleFetchLive}
                    disabled={loading || activeAsset !== "gold"}
                    style={{
                      padding: "2px 8px",
                      fontSize: 10,
                      fontWeight: "bold",
                      borderRadius: 4,
                      border: "1px solid rgba(34,197,94,0.3)",
                      background: "rgba(34,197,94,0.1)",
                      color: "#22c55e",
                      cursor: loading || activeAsset !== "gold" ? "not-allowed" : "pointer",
                      marginRight: 8
                    }}
                  >
                    {loading ? "UPDATING..." : "FETCH FROM API"}
                  </button>
                  {error && <span style={{ color: "red", fontSize: 10, marginRight: 8 }}>{error}</span>}
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#22c55e",
                      boxShadow: "0 0 6px #22c55e",
                      display: "inline-block",
                      animation: "pulse 2s infinite",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: "#777",
                      letterSpacing: "0.08em",
                    }}
                  >
                    LIVE
                  </span>
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeAsset}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  style={{ textAlign: "right" }}
                >
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#111",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    ${activeAsset === "gold" ? displayPrice : "26.00"}
                  </div>
                  <div
                    style={{ color: "#22c55e", fontSize: 13, fontWeight: 600 }}
                  >
                    ▲ +2.90%
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={displayData} barSize={34}>
                <XAxis
                  dataKey="time"
                  tick={{
                    fontSize: 11,
                    fill: "#aaa",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(232,180,13,0.05)" }}
                />
                <Bar
                  dataKey="value"
                  name={activeAsset}
                  radius={[6, 6, 0, 0]}
                >
                  {displayData.map((entry, index) => {
                    let fillColor = activeAsset === "gold" ? C.gold : "#b0b8c4";
                    if (entry.isForecast) fillColor = "#22c55e";
                    if (entry.isInterpolated) fillColor = "#d1d5db";

                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={fillColor}
                        fillOpacity={entry.isForecast ? 0.8 : (entry.isInterpolated ? 0.5 : 1)}
                        stroke={entry.isForecast ? "#22c55e" : "none"}
                        strokeDasharray={entry.isForecast ? "4 4" : "0"}
                      />
                    );
                  })}
                  <LabelList 
                    dataKey="value" 
                    content={(props) => {
                      const { x, y, width, index } = props;
                      const entry = displayData[index];
                      if (entry && entry.isInterpolated) {
                        return (
                          <circle cx={x + width/2} cy={y - 10} r={3} fill="#dc2626" />
                        );
                      }
                      return null;
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bottom cards */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            {/* ── Card 1 : AI Price Forecast ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{
                ...innerCard,
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}
            >
              {/* Top : icon gauche + label */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    flexShrink: 0,
                    background: "rgba(232,180,13,0.1)",
                    border: `1px solid rgba(232,180,13,0.2)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <polyline
                      points="22 7 13.5 15.5 8.5 10.5 2 17"
                      stroke={C.gold}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="16 7 22 7 22 13"
                      stroke={C.gold}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.13em",
                    color: "#aaa",
                    textTransform: "uppercase",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  AI Price Forecast
                </span>
              </div>

              {/* Layout : texte gauche + mini chart droite */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#999",
                      fontFamily: "'DM Sans', sans-serif",
                      marginBottom: 3,
                    }}
                  >
                    2-Day Forecast Target
                  </div>
                  <div
                    style={{

                      fontSize: 24,
                      fontWeight: 800,
                      color: "#102C1D",
                      fontFamily: "'DM Sans', sans-serif",
                      lineHeight: 1.1,
                    }}
                  >
                    ${currentForecast.target_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                {/* Mini chart aligné à droite */}
                <div style={{ width: 110, height: 50, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height={50}>
                    <LineChart
                      data={currentForecast.forecastData}
                      margin={{ top: 4, right: 2, bottom: 2, left: 2 }}
                    >
                      <Line
                        type="monotone"
                        dataKey="ai"
                        stroke={C.gold}
                        strokeWidth={2.5}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#102C1D"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  marginTop: 14,
                  height: 4,
                  background: "#f0ece0",
                  borderRadius: 4,
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "62%" }}
                  transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`,
                    borderRadius: 4,
                  }}
                />
              </div>
            </motion.div>

            {/* ── Card 2 : AI Confidence ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              style={{
                ...innerCard,
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Top : icon gauche + label + grand % droite */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: "rgba(34,197,94,0.08)",
                      border: "1.5px solid rgba(34,197,94,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="#22c55e"
                        strokeWidth="1.8"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="5"
                        stroke="#22c55e"
                        strokeWidth="1.8"
                      />
                      <circle cx="12" cy="12" r="1.5" fill="#22c55e" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.13em",
                      color: "#aaa",
                      textTransform: "uppercase",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    AI Confidence
                  </span>
                </div>
                {/* Big % — top right */}
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    lineHeight: 1,
                    fontFamily: "'DM Sans', sans-serif",
                    background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {animatedConf.toFixed(1)}%
                </div>
              </div>

              {/* Target price bottom */}
              <div style={{ marginTop: "auto" }}>
                <div
                  style={{
                    color: currentForecast.prophet_change >= 0 ? "#22c55e" : "#ef4444",
                    fontSize: 14,
                    fontWeight: 700,
                    marginTop: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{currentForecast.prophet_change >= 0 ? "↗" : "↘"}</span>
                  {currentForecast.prophet_change > 0 ? "+" : ""}{currentForecast.prophet_change.toFixed(2)}% from current
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Right — AI Advisory ── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            background: C.advisory,
            borderRadius: 20,
            padding: "28px 24px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            border: `2px solid #89BE9F`,
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top gold accent line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "15%",
              right: "15%",
              height: "2px",
              background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
            }}
          />

          {/* Label */}
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "#6a8a72",
              textTransform: "uppercase",
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: 4,
              textAlign: "center",
            }}
          >
            AI Advisory Sentiment
          </div>

          {/* Gauge */}
          <SentimentGauge signal={currentForecast.signal} />

          {/* Labels SELL / NEUTRAL / BUY */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              padding: "0 6px",
              marginTop: -10,
            }}
          >
            {["SELL", "NEUTRAL", "BUY"].map((l) => (
              <span
                key={l}
                style={{
                  color: "#9aaa9a",
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {l}
              </span>
            ))}
          </div>

          {/* AI Signal Label */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5, type: "spring" }}
            style={{ textAlign: "center", marginTop: 8 }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 900,
                fontFamily: "'Cinzel', serif",
                color: currentForecast.signal.includes("BUY")
                  ? C.darkGreen
                  : currentForecast.signal.includes("SELL")
                    ? "#ef4444"
                    : "#1a1a1a", // Noir pour Neutral / Hold
                letterSpacing: "0.06em",
              }}
            >
              {currentForecast.signal}
            </span>
          </motion.div>

          {/* AI Quote card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            style={{
              background: "#FEF9E5",
              border: `1.5px solid #ef4444`,
              borderRadius: 14,
              padding: "18px 16px 16px",
              position: "relative",
              marginTop: 25,
              width: "100%",
            }}
          >
            {/* Small gold badge */}
            <div
              style={{
                position: "absolute",
                top: -11,
                left: 14,
                width: 22,
                height: 22,
                borderRadius: 6,
                background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: "#fff",
                fontWeight: 700,
                boxShadow: `0 2px 8px rgba(232,180,13,0.4)`,
              }}
            >
              ✦
            </div>

            <p
              style={{
                color: "#102C1D",
                fontSize: 12.5,
                lineHeight: 1.75,
                margin: 0,
                fontFamily: "'DM Sans', sans-serif",
                fontStyle: "italic",
              }}
            >
              "Gold is {currentForecast.signal.includes("BUY") ? "showing bullish strength with institutional accumulation" : currentForecast.signal.includes("SELL") ? "facing downward pressure and market exhaustion" : "currently in a phase of neutral consolidation"}.
              Analysis suggests a {Math.abs(currentForecast.prophet_change).toFixed(1)}% {currentForecast.prophet_change >= 0 ? "upside potential" : "downside risk"} within the AI recommendation window.
              Key drivers: {currentForecast.reasons.slice(0, 3).join(", ")}."
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
