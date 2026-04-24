package com.prizmagold.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EstimationResponseDTO {
    private String materialCost;
    private String laborCost;
    private String taxAmount;         // null if taxes = 0
    private String benefitAmount;     // null if benefits = 0
    private String totalCost;
    private String totalForQuantity;  // null if quantity = 1
    private String goldPriceUsed;
    private String currency;          // always "USD"
    private int    quantity;
}