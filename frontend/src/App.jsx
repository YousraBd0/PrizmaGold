import "./styles/StudioPage.module.css";
import "./App.css";
import "./styles/styles.css";

import StudioPage from "./component/StudioPage";
import SideBar from "./component/SideBar";
import Market from "./component/Market";
import EditProfile from "./component/EditProfile";
// ✅ Nouveaux composants récupérés depuis le pull
import ProfileCard from "./component/ProfileCard";
import StatsSection from "./component/StatsSection";
// ✅ Ton composant Dashboard (page complète avec market data + trending)
import Dashboard from "./component/Dashboard";
// ✅ TrendingPage
import TrendingPage from "./component/TrendingPage";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ⛔ SUPPRIMÉ : la fonction Dashboard() inline du pull (les cartes Portfolio Value)
//    → remplacée par le vrai composant Dashboard importé ci-dessus

// ─── Profile ──────────────────────────────────────────────────────────────────
function Profile({ setActiveTab }) {
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
          marginBottom: 32,
        }}
      >
        Profile
      </h1>

      {/* ✅ Nouveaux composants du pull */}
      <ProfileCard onEditClick={() => setActiveTab("edit-profile")} />
      <StatsSection />

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 28,
          }}
        >
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
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                color: "#111",
              }}
            >
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
              <span
                style={{
                  color: "#888",
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {row.label}
              </span>
              <span
                style={{
                  color: "#111",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
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

// ─── renderPage ───────────────────────────────────────────────────────────────
function renderPage(activeTab, setActiveTab) {
  switch (activeTab) {
    case "dashboard":
      // ✅ Vrai composant Dashboard avec prop onViewTrending
      return <Dashboard onViewTrending={() => setActiveTab("trending")} />;

    case "trending":
      // ✅ TrendingPage avec sidebar cachée + bouton retour
      return <TrendingPage onBack={() => setActiveTab("dashboard")} />;

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
      return <Dashboard onViewTrending={() => setActiveTab("trending")} />;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  // ✅ "dashboard" par défaut
  const [activeTab, setActiveTab] = useState("dashboard");

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
      {/* ✅ Sidebar cachée sur la page trending */}
      {activeTab !== "trending" && (
        <SideBar activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

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
