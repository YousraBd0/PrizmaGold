import "./styles/StudioPage.module.css";
import "./App.css";
import StudioPage from "./component/StudioPage";
import SideBar from "./component/SideBar";
import Market from "./component/Market";
import EditProfile from "./component/EditProfile";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: "40px 36px" }}
    >
      <h1
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 32,
          color: "#1a1a1a",
          marginBottom: 8,
        }}
      >
        Dashboard
      </h1>
      <p style={{ color: "#888", fontFamily: "'DM Sans', sans-serif" }}>
        Welcome back, Alexandra. Your portfolio overview will appear here.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          marginTop: 32,
        }}
      >
        {[
          { label: "Portfolio Value", value: "$124,850", change: "+3.2%", positive: true },
          { label: "Gold Holdings", value: "58.4 oz", change: "+1.8%", positive: true },
          { label: "Silver Holdings", value: "1,240 oz", change: "-0.4%", positive: false },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(212,160,23,0.15)" }}
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.05)",
              cursor: "default",
            }}
          >
            <div style={{ fontSize: 11, color: "#999", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#111", fontFamily: "'DM Sans', sans-serif" }}>
              {card.value}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6, color: card.positive ? "#22c55e" : "#ef4444" }}>
              {card.positive ? "▲" : "▼"} {card.change}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
function Profile({ setActiveTab }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: "40px 36px" }}
    >
      <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 32, color: "#1a1a1a" }}>
        Profile
      </h1>
      <div
        style={{
          marginTop: 32,
          background: "#fff",
          borderRadius: 20,
          padding: 32,
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
          maxWidth: 480,
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #d4a017, #8b6914)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              boxShadow: "0 4px 16px rgba(212,160,23,0.3)",
              border: "3px solid rgba(212,160,23,0.3)",
            }}
          >
            👑
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", color: "#111" }}>
              Alexandra T.
            </div>
            <div style={{ fontSize: 13, color: "#d4a017", marginTop: 2 }}>
              Master Jeweler · Premium Member
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          {[
            { label: "Email", value: "alexandra@prizma.gold" },
            { label: "Account Type", value: "Premium" },
            { label: "Member Since", value: "January 2023" },
            { label: "Location", value: "Geneva, Switzerland" },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid #f5f5f0",
              }}
            >
              <span style={{ color: "#888", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                {row.label}
              </span>
              <span style={{ color: "#111", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: "#333" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab("edit-profile")}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            backgroundColor: "#1a1a1a",
            color: "#fff",
            border: "none",
            fontSize: "14px",
            fontWeight: "600",
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "16px" }}>✎</span>
          Edit Profile
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── renderPage : fonction pure, pas d'objet avec JSX ────────────────────────
function renderPage(activeTab, setActiveTab) {
  switch (activeTab) {
    case "dashboard":
      return <Dashboard />;
    case "ai-studio":
      return <StudioPage />;
    case "market-intel":
      return <Market />;
    case "profile":
      return <Profile setActiveTab={setActiveTab} />;
    case "edit-profile":
      return (
        <EditProfile
          onCancel={() => setActiveTab("profile")}
          onSave={() => setActiveTab("profile")}
        />
      );
    default:
      return <Dashboard />;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("market-intel");

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
        background: "#f8f7f4",
      }}
    >
      <SideBar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            style={{ height: "100%", overflow: "auto" }}
          >
            {renderPage(activeTab, setActiveTab)}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}