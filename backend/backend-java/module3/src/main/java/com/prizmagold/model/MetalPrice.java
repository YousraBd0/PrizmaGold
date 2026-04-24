package com.prizmagold.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Data
@Entity
@Table(name = "metal_prices")
public class MetalPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("priceId")
    private Long priceId;

    @Column(nullable = false, length = 20)
    @JsonProperty("metalType")
    private String metalType;

    @Column(nullable = false, precision = 12, scale = 4)
    @JsonProperty("priceUsd")
    private BigDecimal priceUsd;

    @Column(precision = 12, scale = 4)
    @JsonProperty("priceEur")
    private BigDecimal priceEur;

    @Column(nullable = false, length = 100)
    @JsonProperty("sourceApi")
    private String sourceApi;

    @Column(nullable = false)
    @JsonProperty("recordedAt")
    private ZonedDateTime recordedAt;

    @Column(nullable = false)
    @JsonProperty("isDailySnapshot")
    private Boolean isDailySnapshot = true;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @JsonProperty("rawResponse")
    private String rawResponse;
}