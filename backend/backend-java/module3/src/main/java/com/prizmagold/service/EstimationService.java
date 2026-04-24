package com.prizmagold.service;

import com.prizmagold.dto.*;
import com.prizmagold.entity.CostSimulation;
import com.prizmagold.model.MetalPrice;
import com.prizmagold.repository.CostSimulationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class EstimationService {

    private final GoldApiService      goldPriceService;
    private final CostSimulationRepository  costSimulationRepository;

    private static final Map<String, Double> METAL_COSTS = Map.of(
        "18k gold",   58.00,
        "rose gold",  55.00,
        "silver 925",  0.90,
        "platinum",   32.00
    );

    private static final Map<String, Double> STONE_COSTS = Map.of(
        "diamond",       800.00,
        "ruby",          350.00,
        "sapphire",      300.00,
        "green emerald", 250.00,
        "pearl",         120.00,
        "opal",          100.00
    );

    public EstimationResponseDTO calculate(EstimationRequestDTO request) throws Exception {
        SpecsDTO    specs    = request.getSpecs();
        FormDataDTO formData = request.getFormData();

        // Validation
        if (formData.getQuantity() < 1)
            throw new IllegalArgumentException("Quantity must be at least 1");

        // Calculations
        MetalPrice goldPrice     = goldPriceService.fetchAndSave();
        double spotPricePerGram  = goldPrice.getPriceUsd().doubleValue() / 31.1035;

        double materialCost = formData.getWeight() * spotPricePerGram * (formData.getKarat() / 24.0);
        double labourCost   = formData.getLabour();
        double pieceCost    = materialCost + labourCost;
        
        double totalCostBeforeTaxAndBenefit = pieceCost * formData.getQuantity();
        Double taxAmount     = formData.getTaxes() > 0 ? formData.getTaxes() : null;
        Double benefitAmount = formData.getBenefits() > 0 ? formData.getBenefits() : null;

        double total = totalCostBeforeTaxAndBenefit
            + (taxAmount     != null ? taxAmount     : 0)
            + (benefitAmount != null ? benefitAmount : 0);

        EstimationResponseDTO response = EstimationResponseDTO.builder()
            .materialCost    (formatMoney(materialCost))
            .laborCost       (formatMoney(labourCost))
            .taxAmount       (taxAmount     != null ? formatMoney(taxAmount)     : null)
            .benefitAmount   (benefitAmount != null ? formatMoney(benefitAmount) : null)
            .totalCost       (formatMoney(total))
            .totalForQuantity(formData.getQuantity() > 1 ? formatMoney(total) : null)
            .goldPriceUsed   (String.format("%.2f", goldPrice.getPriceUsd().doubleValue()))
            .currency        ("USD")
            .quantity        (formData.getQuantity())
            .build();

        // ── Save to PostgreSQL ──────────────────────────
        saveSimulation(specs, formData, materialCost, labourCost, total, goldPrice, request.getDesignId());

        return response;
    }

    private void saveSimulation(SpecsDTO specs, FormDataDTO formData, double materialCost, double labourCost, double total, MetalPrice goldPrice, java.util.UUID designId) {
        CostSimulation simulation = new CostSimulation();
        simulation.setMetalPrice(goldPrice);
        simulation.setDesignId(designId);
        
        // --- Form Inputs ---
        simulation.setClientName(formData.getClientName());
        simulation.setMetal(specs.getMetal());
        simulation.setSize(formData.getSize() != null && !formData.getSize().isEmpty() ? formData.getSize() : specs.getSize());
        simulation.setWeight(String.valueOf(formData.getWeight()));
        simulation.setKarat(formData.getKarat());
        simulation.setQuantity(formData.getQuantity());
        
        // --- Costs ---
        simulation.setMetalCostUsd(java.math.BigDecimal.valueOf(materialCost));
        simulation.setLaborCostUsd(java.math.BigDecimal.valueOf(labourCost));
        simulation.setTaxesUsd(java.math.BigDecimal.valueOf(formData.getTaxes()));
        simulation.setBenefitsUsd(java.math.BigDecimal.valueOf(formData.getBenefits()));
        simulation.setTotalProductionCost(java.math.BigDecimal.valueOf(total));
        // Profit margin is also null since selling price is not calculated.

        costSimulationRepository.save(simulation);
    }

    private String formatMoney(double amount) {
        return String.format("%,.2f $", amount);
    }
}