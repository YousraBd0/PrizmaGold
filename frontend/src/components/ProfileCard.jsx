import React from "react";

const ProfileCard = () => {
  return (
    <div className="card profile-card">
      {/* Banner décoratif */}
      <div className="profile-banner">
        <div className="banner-pattern" />
      </div>

      {/* Avatar */}
      <div className="avatar-wrapper">
        <div className="avatar-container"></div>
        <div className="avatar-badge">✦</div>
      </div>

      {/* Nom + titre */}
      <h2 className="profile-name">Amira Yasmine</h2>
      <p className="profile-role">Master Jeweler & Designer</p>

      {/* Divider doré */}
      <div className="gold-divider">
        <span className="divider-line" />
        <span className="divider-icon">💎</span>
        <span className="divider-line" />
      </div>

      {/* Contact */}
      <div className="contact-info">
        <div className="contact-row">
          <span className="contact-icon">✉</span>
          <span>Amirayasmine@prizmagold.com</span>
        </div>
        <div className="contact-row">
          <span className="contact-icon">✆</span>
          <span>+1 (555) 234-5678</span>
        </div>
        <div className="contact-row">
          <span className="contact-icon">⊙</span>
          <span>New York, NY</span>
        </div>
      </div>

      {/* Badges mini */}
      <div className="mini-badges">
        <span className="mini-badge">🪙 500+ Pieces</span>
        <span className="mini-badge">🌟 4.9 Rating</span>
      </div>

      {/* Bouton */}
      <button className="edit-btn">✎ Edit Profile</button>
    </div>
  );
};

export default ProfileCard;
