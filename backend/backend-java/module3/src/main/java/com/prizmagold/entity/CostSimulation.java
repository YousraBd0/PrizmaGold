package com.prizmagold.entity;

import com.prizmagold.model.MetalPrice;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "cost_simulations")
@Data
public class CostSimulation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "simulation_id", updatable = false, nullable = false)
    private UUID simulationId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "design_id")
    private UUID designId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "metal_price_id", nullable = false)
    private MetalPrice metalPrice;

    // --- Inputs from the frontend form ---
    @Column(name = "client_name")
    private String clientName;

    @Column(name = "metal")
    private String metal;

    @Column(name = "size")
    private String size;

    @Column(name = "weight")
    private String weight;

    @Column(name = "karat")
    private double karat;

    @Column(name = "quantity", nullable = false)
    private int quantity = 1;

    // --- Costs ---
    @Column(name = "metal_cost_usd", nullable = false, precision = 12, scale = 4)
    private BigDecimal metalCostUsd;

    @Column(name = "labor_cost_usd", nullable = false, precision = 12, scale = 4)
    private BigDecimal laborCostUsd;

    @Column(name = "taxes_usd", precision = 12, scale = 4)
    private BigDecimal taxesUsd;

    @Column(name = "benefits_usd", precision = 12, scale = 4)
    private BigDecimal benefitsUsd;

    @Column(name = "total_production_cost", nullable = false, precision = 12, scale = 4)
    private BigDecimal totalProductionCost;

    @Column(name = "profit_margin_pct", precision = 6, scale = 2)
    private BigDecimal profitMarginPct;

    @Column(name = "simulated_at", nullable = false, updatable = false)
    private ZonedDateTime simulatedAt;

    @PrePersist
    protected void onCreate() {
        if (simulatedAt == null) {
            simulatedAt = ZonedDateTime.now();
        }
    }
}
