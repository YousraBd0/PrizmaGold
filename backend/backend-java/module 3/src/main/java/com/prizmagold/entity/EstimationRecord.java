package com.prizmagold.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "estimation_records")
@Data
public class EstimationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Request: specs ──────────────────────────────
    @Column(name = "metal")
    private String metal;

    @Column(name = "stone")
    private String stone;

    @Column(name = "size")
    private String size;

    @Column(name = "weight")
    private String weight;

    // ── Request: formData ───────────────────────────
    @Column(name = "client_name")
    private String clientName;

    @Column(name = "quantity")
    private int quantity;

    @Column(name = "labour")
    private double labour;

    @Column(name = "taxes")
    private double taxes;

    @Column(name = "benefits")
    private double benefits;

    // ── Response / computed results ─────────────────
    @Column(name = "material_cost")
    private String materialCost;

    @Column(name = "labor_cost")
    private String laborCost;

    @Column(name = "tax_amount")
    private String taxAmount;

    @Column(name = "benefit_amount")
    private String benefitAmount;

    @Column(name = "total_cost")
    private String totalCost;

    @Column(name = "total_for_quantity")
    private String totalForQuantity;

    @Column(name = "gold_price_used")
    private String goldPriceUsed;

    @Column(name = "currency")
    private String currency;

    // ── Metadata ────────────────────────────────────
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
