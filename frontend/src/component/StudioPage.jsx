import React, { useState } from "react";
import styles from "../styles/StudioPage.module.css";
import DetailsPanel from "./DetailsPanel";
import AISidePanel from "./AISidePanel";
import bgEmeraldSatin from "../assets/Gemini_Generated_Image.png";

const METALS = {
  emerald:   { label: "Emerald",   metalName: "18k Gold" },
  malachite: { label: "Malachite", metalName: "Silver 925" },
  verdigris: { label: "Verdigris", metalName: "Rose Gold" },
  jade:      { label: "Jade",      metalName: "Platinum" },
};

const DEFAULT_SPECS = {
  name:   "Emerald Ring",
  size:   "20",
  stone:  "Green Emerald",
  weight: "3.2 g",
  cost:   "3,150.00 $",
};

const StudioPage = () => {
  const [activeMetal, setActiveMetal] = useState("emerald");
  const [specs, setSpecs] = useState(DEFAULT_SPECS);

  const handleDesignUpdate = (prompt) => {
    const lower = prompt.toLowerCase();
    let metal = activeMetal;
    if (lower.includes("silver") || lower.includes("platinum")) metal = "jade";
    else if (lower.includes("copper") || lower.includes("rose")) metal = "verdigris";
    else if (lower.includes("malachite"))                         metal = "malachite";
    else if (lower.includes("gold") || lower.includes("emerald")) metal = "emerald";

    setActiveMetal(metal);
    setSpecs({
      name:   prompt.length > 38 ? prompt.slice(0, 38) + "…" : prompt,
      size:   "20",
      stone:  lower.includes("ruby")     ? "Ruby"
            : lower.includes("sapphire") ? "Sapphire"
            : lower.includes("diamond")  ? "Diamond"
            : "Green Emerald",
      weight: "3.2 g",
      cost:   "3,150.00 $",
    });

    return metal;
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
          specs={{ ...specs, metal: METALS[activeMetal].metalName }}
        />
        <AISidePanel onDesignUpdate={handleDesignUpdate} />
      </div>
    </div>
  );
};

export default StudioPage;
