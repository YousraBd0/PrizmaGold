import React from "react";
import { FaMoon } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { FiTrendingUp } from "react-icons/fi";
import { useTrendingPreview, useClusters } from "../hooks/useTrends";
import { useMetalPrice } from "../hooks/useMetalPrice";

const Dashboard = ({ onViewTrending, onViewMarketIntel, onViewAIStudio, darkMode, toggleDarkMode }) => {
  const { products, loading, error } = useTrendingPreview();
  const { clusters } = useClusters();
  const { prices: metalPrices, loading: priceLoading } = useMetalPrice();

  const latestGoldPrice =
    metalPrices?.length > 0 && !isNaN(parseFloat(metalPrices[0].price_usd))
      ? parseFloat(metalPrices[0].price_usd)
      : null;
  const formattedPrice =
    latestGoldPrice !== null
      ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(latestGoldPrice)
      : priceLoading
        ? "Loading..."
        : "No data";

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

      <div className="dashboard-columns">
        <div className="dashboard-col-left">
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
            </div>
          </div>

          <div className="trending">
            <div className="trending-header">
              <h2 className="section-title">Trending Now</h2>
              <button className="link-btn-gold" onClick={onViewTrending}>
                VIEW GLOBAL TRENDS &gt;
              </button>
            </div>

            <div className="trending-cards">
              {loading && <p style={{ color: "#7a7a7a" }}>Loading trends...</p>}
              {error && <p style={{ color: "red" }}>API not reachable</p>}
              {!loading &&
                !error &&
                products.map((product) => (
                  <div key={product.id} className="trend-card luxury-static-bg">
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
                          {product.trend_score ? product.trend_score.toFixed(2) : "0.70"}
                        </span>
                        <span className="trend-label">Trend Score</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {clusters.length > 0 && (
              <div className="cluster-section-inline">
                <div className="section-label" style={{ margin: "24px 0 16px" }}>
                  MARKET INTELLIGENCE · TREND BY STYLE
                </div>
                <div className="cluster-cards-row">
                  {clusters.map((cluster) => {
                    const cfg = statusConfig[cluster.status] || statusConfig.emerging;
                    return (
                      <div key={cluster.cluster_id} className="cluster-card-inline">
                        <div className="cluster-card-header">
                          <span className="cluster-status" style={{ color: cfg.color }}>
                            {cfg.label}
                          </span>
                        </div>
                        <div className="cluster-name">{cluster.cluster_name}</div>
                        <div className="cluster-meta">
                          <div className="cluster-score">
                            <span className="cluster-score-label">TREND SCORE</span>
                            <span className="cluster-score-val">
                              {cluster.avg_trend.toFixed(2)}
                            </span>
                          </div>
                          <div className="cluster-count">
                            <span className="cluster-count-label">PIECES</span>
                            <span className="cluster-count-val">{cluster.count}</span>
                          </div>
                        </div>
                        <div className="cluster-bar-bg">
                          <div
                            className="cluster-bar-fill"
                            style={{ width: `${cluster.avg_trend * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-col-right">
          <div className="quick-actions">
            <div className="section-label">Quick Actions</div>
            <button className="qa-card" onClick={onViewAIStudio}>
              <div className="qa-icon" style={{ color: "#d4af37", backgroundColor: "#fdfaf3" }}>
                <BsStars size={22} />
              </div>
              <div className="qa-text">
                <div className="qa-title">AI Design</div>
                <div className="qa-sub">Create custom pieces</div>
              </div>
            </button>
            <button className="qa-card" onClick={onViewMarketIntel}>
              <div className="qa-icon" style={{ color: "#092615", backgroundColor: "#f2f8f4" }}>
                <FiTrendingUp size={22} />
              </div>
              <div className="qa-text">
                <div className="qa-title">Market Intel</div>
                <div className="qa-sub">Live price tracking</div>
              </div>
            </button>
          </div>

          <aside className="reach-card" style={{ marginTop: '0' }}>
            <div className="section-label">Your reach</div>
            <div className="reach-main">
              <span className="reach-number">2.4k</span>
              <span className="reach-label">Saved designs</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
