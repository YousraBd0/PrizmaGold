import React, { useState } from "react";
import styles from "../styles/StudioPage.module.css";
import DetailsPanel from "./DetailsPanel";
import AISidePanel from "./AISidePanel";
import bgEmeraldSatin from "../assets/Gemini_Generated_Image.png";

const StudioPage = () => {
  const [specs, setSpecs] = useState({
    size: "20",
    metal: "18k Gold",
    stone: "Green Emerald",
    weight: "3.2 g",
    cost: "3,150.00 $",
  });

  const [activeMetal, setActiveMetal] = useState("emerald");
  const [modelUrl, setModelUrl] = useState(null); // NEW: Track the 3D model path

  const handleDesignUpdate = (newSpecs, newModelUrl) => {
    if (newSpecs) {
      setSpecs(newSpecs);
      if (newSpecs.metal) {
        // Map the metal name from the API to your METALS object keys
        const metalMap = {
          "18k gold": "emerald",
          "rose gold": "verdigris",
          "silver 925": "malachite",
          platinum: "jade",
        };
        const key = metalMap[newSpecs.metal.toLowerCase()] ?? "emerald";
        setActiveMetal(key);
      }
    }
    if (newModelUrl) {
      setModelUrl(newModelUrl);
    }
  };

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
          modelUrl={modelUrl}
        />
        <AISidePanel onDesignUpdate={handleDesignUpdate} currentSpecs={specs} />
      </div>
    </div>
  );
};

export default StudioPage;
