import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMetalPrice } from "../hooks/useMetalPrice";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
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

const forecastData = [
  { day: "Mon", ai: 2090, actual: 2085 },
  { day: "Tue", ai: 2100, actual: 2095 },
  { day: "Wed", ai: 2115, actual: 2110 },
  { day: "Thu", ai: 2130, actual: null },
  { day: "Fri", ai: 2145, actual: null },
];

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
function SentimentGauge() {
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

        {/* Needle pointing toward BUY */}
        <motion.line
          x1="100"
          y1="100"
          x2="100"
          y2="28"
          stroke="#102C1D"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ transformOrigin: "100px 100px" }}
          initial={{ rotate: -85 }}
          animate={{ rotate: 58 }}
          transition={{
            duration: 1.6,
            ease: [0.34, 1.56, 0.64, 1],
            delay: 0.4,
          }}
          filter="url(#needleGlow)"
        />
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

  const { prices, loading, error, fetchNewPrice } = useMetalPrice();
  
  // Use the latest price from the API if available. Otherwise, fallback.
  const latestPrice = prices && prices.length > 0 
    ? prices[0].priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "2,118.00";


  useEffect(() => {
    const timer = setTimeout(() => {
      let v = 0;
      const iv = setInterval(() => {
        v += 1.4;
        if (v >= 88.4) {
          setAnimatedConf(88.4);
          clearInterval(iv);
        } else setAnimatedConf(parseFloat(v.toFixed(1)));
      }, 18);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const displayData = prices && prices.length > 0 
    ? [...prices].reverse().map((p) => {
        const d = new Date(p.recordedAt);
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const silverVal = p.priceUsd * 0.012; // dynamic ratio fallback since DB only has XAU
        return {
          time: timeStr,
          gold: p.priceUsd,
          silver: silverVal,
          value: activeAsset === "gold" ? p.priceUsd : silverVal
        };
      })
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

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: "flex",
            gap: 2,
            background: "#f5f5f0",
            borderRadius: 50,
            padding: 4,
            border: `1px solid ${C.cardBorder}`,
          }}
        >
          {["gold", "silver"].map((asset) => (
            <motion.button
              key={asset}
              onClick={() => setActiveAsset(asset)}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "8px 18px",
                borderRadius: 50,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                background:
                  activeAsset === asset
                    ? asset === "gold"
                      ? `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`
                      : "linear-gradient(135deg, #9ca3af, #d1d5db)"
                    : "transparent",
                color: activeAsset === asset ? "#fff" : "#888",
                boxShadow:
                  activeAsset === asset
                    ? `0 2px 10px rgba(232,180,13,0.35)`
                    : "none",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  display: "inline-block",
                  background: asset === "gold" ? C.gold : "#9ca3af",
                }}
              />
              {asset === "gold" ? "GOLD (XAU)" : "SILVER (XAG)"}
            </motion.button>
          ))}
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
                    onClick={fetchNewPrice}
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
                  {error && <span style={{color: "red", fontSize: 10, marginRight: 8}}>{error}</span>}
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
                    ${activeAsset === "gold" ? latestPrice : "26.00"}
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
                  fill={activeAsset === "gold" ? C.gold : "#b0b8c4"}
                  radius={[6, 6, 0, 0]}
                />
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
                    February Target
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
                    $2,310.00
                  </div>
                </div>
                {/* Mini chart aligné à droite */}
                <div style={{ width: 110, height: 50, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height={50}>
                    <LineChart
                      data={forecastData}
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
                    fontSize: 11,
                    color: "#999",
                    fontFamily: "'DM Sans', sans-serif",
                    marginBottom: 3,
                  }}
                >
                  Target Price
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#102C1D",
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1.2,
                  }}
                >
                  $2,110.00
                </div>
                <div
                  style={{
                    color: "#22c55e",
                    fontSize: 12,
                    fontWeight: 600,
                    marginTop: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <span>↗</span> +2.15% from current
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
          <SentimentGauge />

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

          {/* STRONG BUY — couleur vert sidebar */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5, type: "spring" }}
            style={{ textAlign: "center", marginTop: 8 }}
          >
            <span
              style={{
                fontSize: 24,
                fontWeight: 900,
                fontFamily: "'Cinzel', serif",
                color: C.darkGreen, // vert du sidebar
                letterSpacing: "0.06em",
              }}
            >
              STRONG BUY
            </span>
          </motion.div>

          {/* AI Quote card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            style={{
              background: "#FEF9E5",
              border: `1px solid rgba(137,190,159,0.4)`,
              borderRadius: 14,
              padding: "18px 16px 16px",
              position: "relative",
              marginTop: 10,
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
              "Gold is showing strong momentum with institutional accumulations.
              Forecast suggests a 2.1% upside within the AI price
              recommendation. Increasing inventory position."
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
