import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

const C = {
  gold: "#E8B40D",
  goldLight: "#f0c840",
  goldDim: "#999866",
  text: "#999866",
  border: "rgba(153,152,102,0.25)",
  active: "rgba(153,152,102,0.14)",
  bg: "#102C1D",
};

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "ai-studio",
    label: "AI Studio",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        <circle
          cx="18"
          cy="6"
          r="2"
          fill="currentColor"
          stroke="none"
          opacity="0.6"
        />
      </svg>
    ),
  },
  {
    id: "market-intel",
    label: "Market Intel",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

export default function SideBar({ activeTab, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: C.bg,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: "4px 0 32px rgba(0,0,0,0.4)",
      }}
    >
      {/* Gold top shimmer */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.goldLight}, ${C.gold}, transparent)`,
        }}
      />

      {/* ── Logo ── */}
      <div
        style={{
          padding: collapsed ? "18px 0" : "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          borderBottom: `1px solid ${C.border}`,
          minHeight: 90,
          overflow: "hidden",
        }}
      >
        {collapsed ? (
          /* Mini crown when collapsed */
          <motion.div
            whileHover={{ scale: 1.1 }}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(232,180,13,0.1)",
              border: `1.5px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={logo}
              alt="logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
            }}
          >
            {/* Logo image */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                width: 58,
                height: 58,
                flexShrink: 0,
                borderRadius: 14,
                overflow: "hidden",
                border: `1.5px solid rgba(232,180,13,0.35)`,
                boxShadow: `0 0 18px rgba(232,180,13,0.28)`,
              }}
            >
              <img
                src={logo}
                alt="Prizma Gold Logo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </motion.div>

            <div>
              <div
                style={{
                  color: C.goldDim,
                  fontFamily: "'Cinzel', serif",
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  lineHeight: 1.15,
                }}
              >
                PriZma Gold
              </div>
              <div
                style={{
                  color: C.goldDim,
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginTop: 3,
                }}
              >
                ◆ Data Elegance ◆
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav
        style={{
          flex: 1,
          padding: "16px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {navItems.map((item, i) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
              whileHover={{ x: collapsed ? 0 : 4 }}
              whileTap={{ scale: 0.97 }}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: collapsed ? "12px 0" : "11px 16px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                background: isActive ? C.active : "transparent",
                color: isActive ? C.goldDim : C.text,
                position: "relative",
                overflow: "hidden",
                transition: "background 0.2s, color 0.2s",
                width: "100%",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "15%",
                    bottom: "15%",
                    width: 3,
                    borderRadius: "0 4px 4px 0",
                    background: `linear-gradient(180deg, ${C.goldLight}, ${C.gold})`,
                    boxShadow: `0 0 8px rgba(232,180,13,0.6)`,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.span
                animate={{ color: isActive ? C.goldLight : C.text }}
                style={{ flexShrink: 0 }}
              >
                {item.icon}
              </motion.span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 400,
                      fontFamily: "'DM Sans', sans-serif",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* ── User ── */}
      <div
        style={{
          padding: collapsed ? "16px 0" : "16px 18px",
          borderTop: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <motion.div
          whileHover={{ scale: 1.08 }}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            flexShrink: 0,
            background: `linear-gradient(135deg, ${C.gold}, #8b6914)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            boxShadow: `0 0 12px rgba(232,180,13,0.3)`,
            border: `2px solid rgba(232,180,13,0.35)`,
            cursor: "pointer",
          }}
        >
          👑
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                style={{
                  color: C.text,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Alexandra T.
              </div>
              <div style={{ color: C.goldDim, fontSize: 11, marginTop: 1 }}>
                Master Jeweler
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Collapse btn ── */}
      <motion.button
        onClick={() => setCollapsed(!collapsed)}
        whileHover={{ scale: 1.1, backgroundColor: "rgba(232,180,13,0.2)" }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: "absolute",
          top: "50%",
          right: -14,
          transform: "translateY(-50%)",
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: C.bg,
          border: `1.5px solid rgba(232,180,13,0.4)`,
          color: C.gold,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        <motion.span
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.3 }}
          style={{ display: "flex", alignItems: "center" }}
        >
          <svg
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </motion.span>
      </motion.button>
    </motion.aside>
  );
}
