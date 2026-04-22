import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import styles from "../styles/StudioPage.module.css";
import coinIcon from "../assets/download.jpg";

const METALS = {
  emerald:   { label: "Emerald",   band: 0xd4a520, gem: 0x00c060 },
  malachite: { label: "Malachite", band: 0xc8c8d8, gem: 0x1a8040 },
  verdigris: { label: "Verdigris", band: 0xb87333, gem: 0x4ab88a },
  jade:      { label: "Jade",      band: 0xe8e8f0, gem: 0x3a9060 },
};

/* ── Three.js Ring Viewer ── */
const RingViewer = ({ activeMetal, modelUrl }) => {
  const mountRef    = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef    = useRef(null);
  const cameraRef   = useRef(null);
  const frameRef    = useRef(null);
  const modelRef    = useRef(null);

  // ── EFFECT 1: Run ONCE on mount ──
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45, el.clientWidth / el.clientHeight, 0.1, 1000
    );
    camera.position.z = 18;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 1));
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      if (modelRef.current) modelRef.current.rotation.y += 0.005;
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
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  // ── EFFECT 2: Swap model when activeMetal or modelUrl changes ──
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // If it's a Pollinations image URL, skip — don't try to load as 3D
    if (modelUrl && modelUrl.includes('pollinations')) return;

    // Remove previous model
    if (modelRef.current) {
      scene.remove(modelRef.current);
      modelRef.current.traverse((child) => {
        if (child.isMesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
      modelRef.current = null;
    }

    if (modelUrl) {
      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          const model = gltf.scene;
          const box    = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size   = box.getSize(new THREE.Vector3());
          const scale  = 12 / Math.max(size.x, size.y, size.z);
          model.scale.setScalar(scale);
          model.position.sub(center.multiplyScalar(scale));
          scene.add(model);
          modelRef.current = model;
        },
        undefined,
        (err) => console.error("GLTFLoader error:", err)
      );
    } else {
      // Fallback torus ring
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(5, 1.6, 32, 100),
        new THREE.MeshStandardMaterial({
          color:     METALS[activeMetal]?.band ?? 0xd4a520,
          metalness: 1,
          roughness: 0.1,
        })
      );
      scene.add(mesh);
      modelRef.current = mesh;
    }
  }, [activeMetal, modelUrl]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
};


/* ── Main ProductCard Component ── */
const ProductCard = ({ activeMetal, setActiveMetal, specs, modelUrl }) => {
  const isImage = modelUrl?.includes('pollinations');

  return (
    <>
      <div className={styles.productCard}>
        <div className={styles.ringViewerWrapper}>

          {isImage ? (
            <div style={{
              width: "100%", height: "100%",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative"
            }}>
              <img
                src={modelUrl}
                alt="AI Generated Jewelry"
                style={{
                  width: "100%", height: "100%",
                  objectFit: "contain", borderRadius: "12px"
                }}
              />
              <div style={{
                position: "absolute", bottom: "10px", right: "10px",
                fontSize: "10px", background: "rgba(212,165,32,0.2)",
                padding: "2px 8px", borderRadius: "10px", color: "#ffd700",
              }}>
                AI Generated ✨
              </div>
            </div>
          ) : (
            <>
              <RingViewer activeMetal={activeMetal} modelUrl={modelUrl} />
              {modelUrl && (
                <div style={{
                  position: "absolute", bottom: "10px", right: "10px",
                  fontSize: "10px", background: "rgba(212,165,32,0.2)",
                  padding: "2px 8px", borderRadius: "10px", color: "#ffd700",
                }}>
                  AI Generated 3D
                </div>
              )}
            </>
          )}

        </div>

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
        <li><span>Ring Size :</span>    <span>{specs?.size   || "—"}</span></li>
        <li><span>Metal :</span>        <span>{specs?.metal  || "—"}</span></li>
        <li><span>Stone :</span>        <span>{specs?.stone  || "—"}</span></li>
        <li><span>Total Weight :</span> <span>{specs?.weight || "—"}</span></li>
      </ul>

      <div className={styles.costBox}>
        <div className={styles.costIconWrapper}>
          <img src={coinIcon} alt="Cost icon" />
        </div>
        <div className={styles.costText}>
          <span className={styles.costLabel}>Estimated Cost:</span>
          <span className={styles.costValue}>{specs?.cost || "Calculating..."}</span>
        </div>
      </div>
    </>
  );
};

export default ProductCard;