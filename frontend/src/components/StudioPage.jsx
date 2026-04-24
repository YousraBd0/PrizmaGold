import React, { useState } from "react";
import styles from "../styles/StudioPage.module.css";
import DetailsPanel from "./DetailsPanel";
import AISidePanel from "./AISidePanel";
import PriceEstimationPage from "./PriceEstimationPage";
import bgEmeraldSatin from "../assets/Gemini_Generated_Image.png";
import { saveConfirmedDesign } from "../services/designService";

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
  const [designId,    setDesignId]    = useState(null);

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

  const handleConfirmDesign = async () => {
    try {
      if (imageUrl) {
        const savedDesign = await saveConfirmedDesign({
          title: specs.name || "Custom AI Design",
          jewelryType: "Ring", // Defaulting to ring for now
          metalType: specs.metal || "Unknown",
          imageUrl: imageUrl,
          userId: null
        });
        if (savedDesign && savedDesign.designId) {
          setDesignId(savedDesign.designId);
        }
      }
    } catch (error) {
      console.error("Failed to save design:", error);
    }
    setConfirmed(true);
  };

  // Module 3: Go to Estimation Page
  if (confirmed) {
    return (
      <PriceEstimationPage
        confirmedDesign={{ specs, imageUrl, designId }}
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
