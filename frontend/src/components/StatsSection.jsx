import React from "react";

import ring from "../assets/ring.jpg";
import bracelet from "../assets/bracelet.jpg";
import photo2 from "../assets/photo2.jpg";
import boucles from "../assets/boucles.jpg";
import mastery from "../assets/Mastery.png";
import diamond from "../assets/Diamond.png";
import starr from "../assets/Starr.png";
import verified from "../assets/verified.png";

const AchievementCard = ({ title, subtitle, icon, color }) => (
  <div className="achievement-card">
    <div className="achievement-glow" style={{ background: color }} />
    <div className="achievement-icon-wrapper" style={{ borderColor: color }}>
      <img src={icon} alt={title} className="achievement-icon-img" />
    </div>
    <div className="achievement-shine" />
    <div className="achievement-title">{title}</div>
    <div className="achievement-subtitle">{subtitle}</div>
    <div className="achievement-bar" style={{ background: color }} />
  </div>
);

const StatsSection = () => {

  const images = [boucles, bracelet, photo2, ring];

  return (
    <div>

     {/* Achievements */}
<div className="section-card">
  <div className="section-header">
    <h3>Achievements</h3>
    <span className="section-badge">4 Unlocked</span>
  </div>

  <div className="achievements-grid">
    <AchievementCard title="Master Jeweler"   subtitle="10+ years experience"    icon={mastery}  color="rgba(212,175,55,0.6)"  />
    <AchievementCard title="Diamond Expert"   subtitle="Certified GIA Graduate"  icon={diamond}  color="rgba(212,175,55,0.6)" />
    <AchievementCard title="Top Seller"       subtitle="500+ pieces sold"        icon={starr}    color="rgba(212,175,55,0.6)"  />
    <AchievementCard title="Verified Artisan" subtitle="Identity verified"       icon={verified} color="rgba(212,175,55,0.6)" />
  </div>
</div>

     {/* Stats */}
<div className="section-card stats-section">
  <div className="stats-header">
    <h3>Performance Overview</h3>
    <span className="stats-live">● Live</span>
  </div>

  <div className="stats-grid">

    <div className="stat-card">
      <div className="stat-icon">💰</div>
      <div className="stat-top">
        <small className="stat-label">Total Sales</small>
        <span className="stat-trend up">↑ 12%</span>
      </div>
      <h2 className="stat-value">$1.2M</h2>
      <div className="stat-progress">
        <div className="stat-progress-fill" style={{ width: "82%" }} />
      </div>
      <span className="stat-sub">this month</span>
    </div>

    <div className="stat-card stat-card-featured">
      <div className="stat-icon">✦</div>
      <div className="stat-top">
        <small className="stat-label">Pieces Created</small>
        <span className="stat-trend up">↑ 23</span>
      </div>
      <h2 className="stat-value">847</h2>
      <div className="stat-progress">
        <div className="stat-progress-fill" style={{ width: "65%" }} />
      </div>
      <span className="stat-sub">this month</span>
    </div>

    <div className="stat-card">
      <div className="stat-icon">⭐</div>
      <div className="stat-top">
        <small className="stat-label">Client Rating</small>
        <span className="stat-trend neutral">142 reviews</span>
      </div>
      <h2 className="stat-value">4.9<span className="stat-unit">/5</span></h2>
      <div className="stat-progress">
        <div className="stat-progress-fill" style={{ width: "98%" }} />
      </div>
      <span className="stat-sub">all time</span>
    </div>

  </div>
</div>

      {/* Recent Creations */}
<div className="section-card">

  <div className="section-header">
    <h3>Recent Creations</h3>
    <div className="creations-header-right">
      <span className="creations-count">4 pieces</span>
      <button className="view-all-btn">View All →</button>
    </div>
  </div>

  <div className="creations-grid">
    {images.map((img, i) => (
      <div className="creation-card" key={i}>
        <img src={img} alt="jewelry item" />
        <div className="creation-overlay">
          
        </div>
        <div className="creation-badge">✦ New</div>
      </div>
    ))}
  </div>

</div>
    </div>
  );
};

export default StatsSection;