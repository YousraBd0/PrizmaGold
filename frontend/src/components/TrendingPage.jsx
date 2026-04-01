// TrendingPage.jsx — products et categories viennent de l'API

import React, { useState } from "react";
import "../index.css";
import all from "../assets/all.png";
import bracelet from "../assets/bracelet.png";
import earing from "../assets/earing.png";
import neck from "../assets/neck.png";
import ring from "../assets/ring.png";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useTrendingAll } from "../hooks/useTrends";

export const categoryIcons = {
  all: all,
  rings: ring,
  necklaces: neck,
  bracelets: bracelet,
  earrings: earing,
};

export default function TrendingPage({ onBack }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [favorites, setFavorites] = useState([]);

  const { products, categories, loading, error } =
    useTrendingAll(activeCategory);

  const toggleFavorite = (id) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );

  return (
    <div className="tp-page">
      <header className="tp-top-bar">
        <button className="tp-back-link" onClick={onBack}>
          &larr; BACK TO DASHBOARD
        </button>
      </header>

      {/* ── Catégories dynamiques depuis l'API ── */}
      <section className="tp-category-section">
        <h2 className="tp-section-title-centered">EXPLORE BY CATEGORY</h2>
        <div className="tp-category-row">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={
                "tp-category-card" +
                (activeCategory === cat.value
                  ? " tp-category-card--active"
                  : "")
              }
              onClick={() => {
                setActiveCategory(cat.value);
                const el = document.getElementById('tp-carousel-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <div className="tp-category-thumb">
                <img src={categoryIcons[cat.value] || all} alt={cat.label} />
              </div>
              <span className="tp-category-count">{cat.count}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Produits dynamiques depuis l'API ── */}
      <section className="tp-product-section" id="tp-carousel-section">
        <div className="tp-product-header-inline">
          <h2 className="tp-section-title-left">MORE POPULAR </h2>
          <div className="tp-nav-arrows">
            <button className="tp-arrow-btn" onClick={() => {
              const el = document.getElementById('tp-carousel');
              if (el) el.scrollBy({ left: -(el.offsetWidth), behavior: 'smooth' });
            }}>&lt;</button>
            <button className="tp-arrow-btn" onClick={() => {
              const el = document.getElementById('tp-carousel');
              if (el) el.scrollBy({ left: el.offsetWidth, behavior: 'smooth' });
            }}>&gt;</button>
          </div>
        </div>

        {loading && (
          <p
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "var(--color-text-secondary)",
            }}
          >
            Loading products...
          </p>
        )}

        {error && (
          <p style={{ color: "red", padding: "1rem" }}>
            Cannot reach API — make sure FastAPI is running on port 8000
          </p>
        )}

        <div className="tp-product-carousel" id="tp-carousel">
          {!loading &&
            !error &&
            products.map((product) => (
              <article key={product.id} className="tp-product-card luxury-hover-bg">
                <div className="tp-product-image-wrapper">
                  {/* Image */}
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="tp-product-image"
                      onError={(e) => {
                        e.target.src = ring;
                      }}
                    />
                  ) : (
                    <div
                      className="tp-product-image"
                      style={{ background: "#111" }}
                    />
                  )}

                  {/* Badge Cluster — droit */}
                  {product.cluster_name &&
                    product.cluster_name !== "no_image" && (
                      <div className="tp-luxury-badge">
                        {product.cluster_name}
                      </div>
                    )}

                  {/* Favori */}
                  <button
                    className="tp-favorite-btn"
                    onClick={() => toggleFavorite(product.id)}
                  >
                    {favorites.includes(product.id) ? (
                      <FaHeart />
                    ) : (
                      <FaRegHeart />
                    )}
                  </button>

                  {/* Overlay titre + prix visibles au survol uniquement */}
                  <div className="tp-product-overlay">
                    <p className="tp-product-category-gold">
                      {product.cluster_name ? product.cluster_name.toUpperCase() : "FINE EARRINGS"}
                    </p>
                    <h3 className="tp-product-title">
                      {product.title.length > 50
                        ? product.title.substring(0, 50) + "..."
                        : product.title}
                    </h3>
                    <div className="tp-product-meta-row">
                      <span>Trend Score: {product.trend_score ? product.trend_score.toFixed(1) : "0.7"}</span>
                      <span className="tp-product-price">
                        ${product.price ? product.price.toFixed(0) : "6800"}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </section>
    </div>
  );
}
