package com.prizmagold.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class EstimationRequestDTO {
    private SpecsDTO    specs;
    private FormDataDTO formData;
    private UUID        designId;
}

