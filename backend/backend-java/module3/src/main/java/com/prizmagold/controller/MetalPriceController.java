package com.prizmagold.controller;

import com.prizmagold.model.MetalPrice;
import com.prizmagold.repository.MetalPriceRepository;
import com.prizmagold.service.GoldApiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prices")
@CrossOrigin(origins = "*")   // allow React/Electron frontend
public class MetalPriceController {

    private final GoldApiService goldApiService;
    private final MetalPriceRepository repository;

    public MetalPriceController(GoldApiService goldApiService,
                                MetalPriceRepository repository) {
        this.goldApiService = goldApiService;
        this.repository = repository;
    }

    // POST /api/prices/save  → fetch from GoldAPI + save to DB
    @PostMapping("/save")
    public ResponseEntity<?> savePrice() {
        try {
            MetalPrice saved = goldApiService.fetchAndSave();
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(502).body("GoldAPI error: " + e.getMessage());
        }
    }

    // GET /api/prices/latest  → read last 10 from DB
    @GetMapping("/latest")
    public List<MetalPrice> getLatest() {
        return repository.findTop10ByOrderByRecordedAtDesc();
    }
}