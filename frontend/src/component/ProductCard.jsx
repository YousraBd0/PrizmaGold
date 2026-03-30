import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import styles from "../styles/StudioPage.module.css";
import coinIcon from "../assets/download.jpg";

const METALS = {
  emerald:   { label: "Emerald",   band: 0xd4a520, bandR: 0.90, bandM: 0.85, gem: 0x00c060, gemE: 0x00ff80 },
  malachite: { label: "Malachite", band: 0xc8c8d8, bandR: 0.95, bandM: 0.90, gem: 0x1a8040, gemE: 0x30d070 },
  verdigris: { label: "Verdigris", band: 0xb87333, bandR: 0.80, bandM: 0.75, gem: 0x4ab88a, gemE: 0x7affc0 },
  jade:      { label: "Jade",      band: 0xe8e8f0, bandR: 0.98, bandM: 0.95, gem: 0x3a9060, gemE: 0x60d090 },
};

/* ── Three.js Ring Viewer ── */
const RingViewer = ({ activeMetal }) => {
  const mountRef  = useRef(null);
  const sceneRef  = useRef({});

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.01, 100);
    camera.position.set(0, 2.2, 4.5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 2;
    controls.maxDistance = 8;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 2);
    key.position.set(4, 6, 3);
    scene.add(key);
    const fill = new THREE.PointLight(0x88ffcc, 1.2, 15);
    fill.position.set(-3, 2, -2);
    scene.add(fill);

    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const buildRing = (k) => {
      while (ringGroup.children.length) {
        const c = ringGroup.children[0];
        c.geometry?.dispose();
        c.material?.dispose();
        ringGroup.remove(c);
      }
      const m = METALS[k];
      ringGroup.add(
        new THREE.Mesh(
          new THREE.TorusGeometry(1, 0.18, 64, 256),
          new THREE.MeshStandardMaterial({ color: m.band, metalness: m.bandM, roughness: 1 - m.bandR })
        )
      );
      const gem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.18),
        new THREE.MeshPhysicalMaterial({ color: m.gem, emissive: m.gemE, emissiveIntensity: 0.3, transmission: 0.9, roughness: 0, metalness: 0 })
      );
      gem.position.y = 1.1;
      ringGroup.add(gem);

      const glow = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.25),
        new THREE.MeshBasicMaterial({ color: m.gemE, transparent: true, opacity: 0.06, side: THREE.BackSide })
      );
      glow.position.copy(gem.position);
      ringGroup.add(glow);
    };

    buildRing(activeMetal || "emerald");
    sceneRef.current = { buildRing };

    let time = 0;
    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      time += 0.016;
      ringGroup.rotation.y += 0.008;
      const gem  = ringGroup.children[1];
      const glow = ringGroup.children[2];
      if (gem)  gem.material.emissiveIntensity  = 0.25 + Math.sin(time * 3) * 0.10;
      if (glow) glow.material.opacity           = 0.05 + Math.sin(time * 2) * 0.03;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  /* Rebuild ring whenever metal changes */
  useEffect(() => {
    if (sceneRef.current.buildRing && activeMetal) {
      sceneRef.current.buildRing(activeMetal);
    }
  }, [activeMetal]);

  return <div ref={mountRef} className={styles.ringViewerMount} />;
};

/* ── ProductCard ── */
const ProductCard = ({ activeMetal, setActiveMetal, specs }) => {
  return (
    <>
      <div className={styles.productCard}>
        <h2 className={styles.productCardTitle}>
          Design: {specs?.name || "Emerald Ring"}
        </h2>

        {/* 3-D viewer replaces the static image */}
        <div className={styles.ringViewerWrapper}>
          <RingViewer activeMetal={activeMetal} />
        </div>

        {/* Metal finish switcher */}
        <div className={styles.metalRow}>
          {Object.entries(METALS).map(([key, m]) => (
            <button
              key={key}
              className={`${styles.metalBtn}${activeMetal === key ? " " + styles.metalBtnActive : ""}`}
              onClick={() => setActiveMetal(key)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.measurementDiv}>Measurement Breakdown</div>

      <ul className={styles.measurementsList}>
        <li><span>Ring Size :</span> <span>{specs?.size   || "20"}</span></li>
        <li><span>Metal :</span>     <span>{specs?.metal  || "18k Gold"}</span></li>
        <li><span>Stone :</span>     <span>{specs?.stone  || "Green Emerald"}</span></li>
        <li><span>Total Weight :</span> <span>{specs?.weight || "3.2 g"}</span></li>
      </ul>

      <div className={styles.costBox}>
        <div className={styles.costIconWrapper}>
          <img src={coinIcon} alt="Cost icon" />
        </div>
        <div className={styles.costText}>
          <span className={styles.costLabel}>Estimated Cost:</span>
          <span className={styles.costValue}>{specs?.cost || "3,150.00 $"}</span>
        </div>
      </div>
    </>
  );
};

export default ProductCard;
