package com.prizmagold.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prizmagold.dto.EstimationRequestDTO;
import com.prizmagold.dto.EstimationResponseDTO;
import com.prizmagold.service.EstimationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EstimationController {

    private final EstimationService estimationService;

    @PostMapping("/estimate")
    public ResponseEntity<EstimationResponseDTO> estimate(
            @RequestBody EstimationRequestDTO request) throws Exception {
        EstimationResponseDTO response = estimationService.calculate(request);
        return ResponseEntity.ok(response);
    }

    // Optional: standalone gold price debug endpoint
    // GET /api/gold-price
}