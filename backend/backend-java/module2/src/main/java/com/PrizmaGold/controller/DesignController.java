package com.PrizmaGold.controller;

import com.PrizmaGold.entity.Design;
import com.PrizmaGold.model.DesignDTO;
import com.PrizmaGold.service.DesignService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/designs")
@CrossOrigin(origins = "*")
public class DesignController {

    private final DesignService designService;

    public DesignController(DesignService designService) {
        this.designService = designService;
    }

    @PostMapping("/save")
    public ResponseEntity<Design> saveDesign(@RequestBody DesignDTO dto) {
        try {
            Design saved = designService.saveDesign(dto);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
