import { useState } from "react";
import { motion } from "framer-motion";

export default function EditProfile({ onCancel, onSave }) {
    const [form, setForm] = useState({
        fullName: "Alexandra Thornton",
        email: "alexandra@prizmagold.com",
        phone: "+1 (555) 234-5678",
        location: "New York, NY",
        specialties: "Gold, mixed metal designs",
        skills: "",
        bio: "",
    });

    const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const inputStyle = {
        width: "100%",
        padding: "10px 14px",
        border: "1.5px solid #e8e5df",
        borderRadius: 10,
        fontSize: 13,
        fontFamily: "'DM Sans', sans-serif",
        color: "#1a1a1a",
        background: "#fff",
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.2s",
    };

    const labelStyle = {
        fontSize: 12,
        fontWeight: 600,
        color: "#555",
        fontFamily: "'DM Sans', sans-serif",
        marginBottom: 6,
        display: "flex",
        alignItems: "center",
        gap: 6,
    };

    const fields = [
        [
            {
                key: "fullName",
                label: "Full Name",

            },
            {
                key: "email",
                label: "Email Address",

            },
        ],
        [
            {
                key: "phone",
                label: "Phone Number",

            },
            {
                key: "location",
                label: "Location",

            },
        ],
        [
            {
                key: "specialties",
                label: "Design Specialties",

            },
            {
                key: "skills",
                label: "Skills",

            },
        ],
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            style={{ padding: "40px 36px" }}
        >
            <h1
                style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 28,
                    color: "#1a1a1a",
                    marginBottom: 24,
                    fontWeight: 700,
                }}
            >
                Edit Profile
            </h1>

            <div
                style={{
                    background: "#fff",
                    borderRadius: 20,
                    padding: "32px 36px",
                    boxShadow: "0 2px 24px rgba(0,0,0,0.07)",
                    border: "1.5px solid rgba(212,160,23,0.18)",
                    maxWidth: 860,
                }}
            >
                <h2
                    style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: 18,
                        color: "#1a1a1a",
                        marginBottom: 28,
                        marginTop: 0,
                    }}
                >
                    Profile Settings
                </h2>

                <div style={{ display: "flex", gap: 40 }}>
                    {/* ── Champs gauche ── */}
                    <div style={{ flex: 1 }}>
                        {fields.map((row, ri) => (
                            <div
                                key={ri}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 20,
                                    marginBottom: 20,
                                }}
                            >
                                {row.map(({ key, label, icon }) => (
                                    <div key={key}>
                                        <label style={labelStyle}>
                                            {icon} {label}
                                        </label>
                                        <input
                                            value={form[key]}
                                            onChange={update(key)}
                                            style={inputStyle}
                                            onFocus={(e) => (e.target.style.borderColor = "#d4a017")}
                                            onBlur={(e) => (e.target.style.borderColor = "#e8e5df")}
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Bio */}
                        <div style={{ marginBottom: 28 }}>
                            <label style={labelStyle}>📝 Bio & Professional Statement</label>
                            <textarea
                                value={form.bio}
                                onChange={update("bio")}
                                rows={4}
                                placeholder="Tell us about your craft and experience..."
                                style={{
                                    ...inputStyle,
                                    resize: "vertical",
                                    lineHeight: 1.6,
                                }}
                                onFocus={(e) => (e.target.style.borderColor = "#d4a017")}
                                onBlur={(e) => (e.target.style.borderColor = "#e8e5df")}
                            />
                        </div>

                        {/* Boutons */}
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={onCancel}
                                style={{
                                    padding: "11px 28px",
                                    borderRadius: 10,
                                    border: "1.5px solid #ddd",
                                    background: "#fff",
                                    color: "#555",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    fontFamily: "'DM Sans', sans-serif",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.03, boxShadow: "0 4px 20px rgba(212,160,23,0.4)" }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => onSave(form)}
                                style={{
                                    padding: "11px 28px",
                                    borderRadius: 10,
                                    border: "none",
                                    background: "linear-gradient(135deg, #d4a017, #b8860b)",
                                    color: "#fff",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    fontFamily: "'DM Sans', sans-serif",
                                    cursor: "pointer",
                                    letterSpacing: "0.02em",
                                }}
                            >
                                Save Changes
                            </motion.button>
                        </div>
                    </div>

                    {/* ── Photo droite ── */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 16,
                            minWidth: 140,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#555",
                                fontFamily: "'DM Sans', sans-serif",
                                letterSpacing: "0.05em",
                            }}
                        >
                            Profile Photo
                        </div>
                        <div
                            style={{
                                width: 96,
                                height: 96,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #1a3a2a, #0f2a1a)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 36,
                                border: "3px dashed rgba(212,160,23,0.5)",
                                cursor: "pointer",
                            }}
                        >
                            👤
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                padding: "9px 16px",
                                borderRadius: 10,
                                border: "1.5px solid #d4a017",
                                background: "transparent",
                                color: "#d4a017",
                                fontSize: 12,
                                fontWeight: 700,
                                fontFamily: "'DM Sans', sans-serif",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Upload New Photo
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}