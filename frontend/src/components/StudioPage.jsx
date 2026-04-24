import React, { useState } from "react";
import styles from "../styles/StudioPage.module.css";
import DetailsPanel from "./DetailsPanel";
import AISidePanel from "./AISidePanel";
import PriceEstimationPage from "./PriceEstimationPage";
import bgEmeraldSatin from "../assets/Gemini_Generated_Image.png";

const StudioPage = () => {
  const [specs, setSpecs] = useState({
    size:   "—",
    metal:  "—",
    stone:  "—",
    weight: "—",
    cost:   "—",
  });

  const [activeMetal, setActiveMetal] = useState("emerald");
  const [imageUrl,    setImageUrl]    = useState(null);
  const [confirmed,   setConfirmed]   = useState(false);

  const handleDesignUpdate = (newSpecs, newImageUrl) => {
    if (newSpecs) {
      setSpecs(newSpecs);

      if (newSpecs.metal) {
        const metalMap = {
          "18k gold":   "emerald",
          "rose gold":  "verdigris",
          "silver 925": "malachite",
          "platinum":   "jade",
        };
        const key = metalMap[newSpecs.metal.toLowerCase()] ?? "emerald";
        setActiveMetal(key);
      }
    }

    if (newImageUrl) setImageUrl(newImageUrl);
  };

  const handleConfirmDesign = () => {
    setConfirmed(true);
  };

  // Module 3: Go to Estimation Page
  if (confirmed) {
    return (
      <PriceEstimationPage
        confirmedDesign={{ specs, imageUrl }}
        onBack={() => setConfirmed(false)}
      />
    );
  }

  // Module 1: Studio Page
  return (
    <div
      className={styles.pageRoot}
      style={{ backgroundImage: `url(${bgEmeraldSatin})` }}
    >
      <div className={styles.mainWrapper}>
        <DetailsPanel
          activeMetal={activeMetal}
          setActiveMetal={setActiveMetal}
          specs={specs}
          imageUrl={imageUrl}
          onConfirmDesign={handleConfirmDesign}
        />
        <AISidePanel
          onDesignUpdate={handleDesignUpdate}
          currentSpecs={specs}
        />
      </div>
    </div>
  );
};

export default StudioPage;
