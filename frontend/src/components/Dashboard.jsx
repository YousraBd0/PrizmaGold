import React from "react";
import { FaMoon } from "react-icons/fa";
import { useTrendingPreview, useClusters } from "../hooks/useTrends";
import { useMetalPrice } from "../hooks/useMetalPrice";

const Dashboard = ({ onViewTrending, onViewMarketIntel, onViewAIStudio, darkMode, toggleDarkMode }) => {
  const { products, loading, error } = useTrendingPreview();
  const { clusters } = useClusters();
  const { prices: metalPrices, loading: priceLoading } = useMetalPrice();

  const latestGoldPrice = metalPrices?.length > 0 ? metalPrices[0].priceUsd : null;
  const formattedPrice = latestGoldPrice !== null 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(latestGoldPrice)
    : priceLoading ? "Loading..." : "--";

  const statusConfig = {
    rising: { emoji: "🔥", label: "Rising", color: "#2d6a4f" },
    stable: { emoji: "📈", label: "Stable", color: "#40916c" },
    emerging: { emoji: "🌱", label: "Emerging", color: "#74c69d" },
  };

  return (
    <main className="main">
      <header className="topbar">
        <div>
          <h1 className="hello-title">Hello, Alexandra!</h1>
          <p className="hello-sub">Let's refine your craft today</p>
        </div>
        <div className="topbar-right">
          <button className="icon-btn" onClick={toggleDarkMode} style={{ color: darkMode ? '#fff' : '#000' }}>
            <FaMoon color={darkMode ? '#fff' : '#000'} />
          </button>
        </div>
      </header>

      <section className="top-widgets">
        <div className="market-section">
          <div className="section-label live-label">
            LIVE MARKET DATA • LIVE
          </div>
          <div className="market-cards">
            <div className="market-card">
              <div className="market-tag gold-tag">G</div>
              <div className="market-info">
                <div className="market-title">GOLD VALUE</div>
              </div>
              <div className="market-price">
                <span className="price">{formattedPrice}</span>
              </div>
            </div>
            {/* <div className="market-card">
              <div className="market-tag silver-tag">S</div>
              <div className="market-info">
                <div className="market-title">SILVER VALUE</div>
              </div>
              <div className="market-price">
                <span className="price">$28.45</span>
              </div>
            </div> */}
          </div>
        </div>

        <div className="quick-actions">
          <div className="section-label">Quick Actions</div>
          <button className="qa-card" onClick={onViewAIStudio}>
            <div className="qa-icon">✨</div>
            <div className="qa-text">
              <div className="qa-title">AI Design</div>
              <div className="qa-sub">Create custom pieces</div>
            </div>
          </button>
          <button className="qa-card" onClick={onViewMarketIntel}>
            <div className="qa-icon">📦</div>
            <div className="qa-text">
              <div className="qa-title">Market Intel</div>
              <div className="qa-sub">Live price tracking</div>
            </div>
          </button>
        </div>
      </section>

      <section className="bottom-section">
        <div className="trending">
          <div className="trending-header">
            <h2 className="section-title">Trending Now</h2>
            <button className="link-btn" onClick={onViewTrending}>
              View global trends
            </button>
          </div>

          {/* ── Cartes trending ── */}
          <div className="trending-cards">
            {loading && <p style={{ color: "#7a7a7a" }}>Loading trends...</p>}
            {error && <p style={{ color: "red" }}>API not reachable</p>}
            {!loading &&
              !error &&
              products.map((product) => (
                <div key={product.id} className="trend-card">
                  <div className="trend-img-wrapper">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="trend-img"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        className="trend-img"
                        style={{ background: "#111" }}
                      />
                    )}
                  </div>
                  <div className="trend-body overlay-body">
                    <div className="trend-title">
                      {product.title.length > 40
                        ? product.title.substring(0, 40) + "..."
                        : product.title}
                    </div>
                    <div className="trend-sub">{product.cluster_name}</div>
                    <div className="trend-meta">
                      <span className="trend-number">
                        {product.trend_score.toFixed(2)}
                      </span>
                      <span className="trend-label">Trend Score</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* ── Clusters EN DESSOUS des cartes ── */}
          {clusters.length > 0 && (
            <div className="cluster-section-inline">
              <div className="section-label" style={{ margin: "16px 0 10px" }}>
                MARKET INTELLIGENCE · TREND BY STYLE
              </div>
              <div className="cluster-cards-row">
                {clusters.map((cluster) => {
                  const cfg =
                    statusConfig[cluster.status] || statusConfig.emerging;
                  return (
                    <div
                      key={cluster.cluster_id}
                      className="cluster-card-inline"
                    >
                      <div
                        className="cluster-card-header"
                        style={{ borderLeft: `3px solid ${cfg.color}` }}
                      >
                        <span className="cluster-emoji">{cfg.emoji}</span>
                        <span
                          className="cluster-status"
                          style={{ color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <div className="cluster-name">{cluster.cluster_name}</div>
                      <div className="cluster-meta">
                        <div className="cluster-score">
                          <span className="cluster-score-val">
                            {cluster.avg_trend.toFixed(2)}
                          </span>
                          <span className="cluster-score-label">
                            Trend Score
                          </span>
                        </div>
                        <div className="cluster-count">
                          <span className="cluster-count-val">
                            {cluster.count}
                          </span>
                          <span className="cluster-count-label">Products</span>
                        </div>
                      </div>
                      <div className="cluster-bar-bg">
                        <div
                          className="cluster-bar-fill"
                          style={{
                            width: `${cluster.avg_trend * 100}%`,
                            background: cfg.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <aside className="reach-card">
          <div className="section-label">Your reach</div>
          <div className="reach-main">
            <span className="reach-number">2.4k</span>
            <span className="reach-label">Saved designs</span>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default Dashboard;
