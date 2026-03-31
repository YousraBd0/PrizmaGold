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
    </motion.div>
  );
}

// ─── renderPage ───────────────────────────────────────────────────────────────
function renderPage(activeTab, setActiveTab, darkMode, setDarkMode) {
  switch (activeTab) {
    case "dashboard":
      return <Dashboard 
        onViewTrending={() => setActiveTab("trending")} 
        onViewAIStudio={() => setActiveTab("ai-studio")}
        onViewMarketIntel={() => setActiveTab("market-intel")}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
      />;

    case "trending":
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
      return <Dashboard 
        onViewTrending={() => setActiveTab("trending")} 
        onViewAIStudio={() => setActiveTab("ai-studio")}
        onViewMarketIntel={() => setActiveTab("market-intel")}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
      />;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
        background: darkMode ? "#121212" : "#f8f7f4",
        color: darkMode ? "#ffffff" : "inherit",
        transition: "background 0.3s, color 0.3s"
      }}
    >
      {activeTab !== "trending" && (
        <SideBar activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      <main 
        className={darkMode ? "dark-mode" : ""} 
        style={{ flex: 1, overflow: "hidden", position: "relative" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            style={{ height: "100%", overflow: "auto" }}
          >
            {renderPage(activeTab, setActiveTab, darkMode, setDarkMode)}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
