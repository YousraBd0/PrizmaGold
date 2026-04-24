package com.prizmagold.service;

import com.prizmagold.dto.*;
import com.prizmagold.entity.EstimationRecord;
import com.prizmagold.model.MetalPrice;
import com.prizmagold.repository.EstimationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class EstimationService {

    private final GoldApiService      goldPriceService;
    private final EstimationRepository  estimationRepository;  // ← injected

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

        double weightGrams;
        try {
            weightGrams = Double.parseDouble(specs.getWeight().replace("g", "").trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid weight format, expected e.g. 3.5 g");
        }

        // Lookup
        double metalCostPerGram = METAL_COSTS.getOrDefault(specs.getMetal().toLowerCase(), 58.00);
        double stoneCost        = STONE_COSTS.getOrDefault(specs.getStone().toLowerCase(), 150.00);

        // Calculations
        MetalPrice goldPrice     = goldPriceService.fetchAndSave();
        double materialCost  = (weightGrams * metalCostPerGram) + stoneCost;
        double labourCost    = formData.getLabour();
        double subtotal      = materialCost + labourCost;

        Double taxAmount     = formData.getTaxes()    > 0 ? subtotal * (formData.getTaxes()    / 100.0) : null;
        Double benefitAmount = formData.getBenefits() > 0 ? subtotal * (formData.getBenefits() / 100.0) : null;

        double total = subtotal
            + (taxAmount     != null ? taxAmount     : 0)
            + (benefitAmount != null ? benefitAmount : 0);

        String totalForQty = formData.getQuantity() > 1
            ? formatMoney(total * formData.getQuantity()) : null;

        EstimationResponseDTO response = EstimationResponseDTO.builder()
            .materialCost    (formatMoney(materialCost))
            .laborCost       (formatMoney(labourCost))
            .taxAmount       (taxAmount     != null ? formatMoney(taxAmount)     : null)
            .benefitAmount   (benefitAmount != null ? formatMoney(benefitAmount) : null)
            .totalCost       (formatMoney(total))
            .totalForQuantity(totalForQty)
            .goldPriceUsed   (String.format("%.2f", goldPrice))
            .currency        ("USD")
            .quantity        (formData.getQuantity())
            .build();

        // ── Save to PostgreSQL ──────────────────────────
        saveRecord(specs, formData, response);

        return response;
    }

    private void saveRecord(SpecsDTO specs, FormDataDTO formData, EstimationResponseDTO response) {
        EstimationRecord record = new EstimationRecord();

        // Request fields
        record.setMetal      (specs.getMetal());
        record.setStone      (specs.getStone());
        record.setSize       (specs.getSize());
        record.setWeight     (specs.getWeight());
        record.setClientName (formData.getClientName());
        record.setQuantity   (formData.getQuantity());
        record.setLabour     (formData.getLabour());
        record.setTaxes      (formData.getTaxes());
        record.setBenefits   (formData.getBenefits());

        // Response fields
        record.setMaterialCost    (response.getMaterialCost());
        record.setLaborCost       (response.getLaborCost());
        record.setTaxAmount       (response.getTaxAmount());
        record.setBenefitAmount   (response.getBenefitAmount());
        record.setTotalCost       (response.getTotalCost());
        record.setTotalForQuantity(response.getTotalForQuantity());
        record.setGoldPriceUsed   (response.getGoldPriceUsed());
        record.setCurrency        (response.getCurrency());

        estimationRepository.save(record);  // ← persists to DB
    }

    private String formatMoney(double amount) {
        return String.format("%,.2f $", amount);
    }
}