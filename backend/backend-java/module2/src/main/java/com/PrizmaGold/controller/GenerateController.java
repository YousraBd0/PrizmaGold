package com.PrizmaGold.controller;

import com.PrizmaGold.model.GenerateRequest;
import com.PrizmaGold.model.GenerateResponse;
import com.PrizmaGold.service.DesignService;
import com.PrizmaGold.store.SessionStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class GenerateController {

    private final DesignService designService;
    private final SessionStore sessionStore;

    public GenerateController(DesignService designService, SessionStore sessionStore) {
        this.designService = designService;
        this.sessionStore = sessionStore;
    }

    @PostMapping("/generate")
    public ResponseEntity<GenerateResponse> handleGenerate(
            @RequestBody GenerateRequest request) {

        if (request.getPrompt() == null || request.getPrompt().trim().length() < 5) {
            return ResponseEntity.badRequest()
                .body(new GenerateResponse("Please describe your design in more detail.", null, null));
        }

        GenerateResponse response = designService.processDesign(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "ok",
            "timestamp", LocalDateTime.now().toString()
        ));
    }

    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<Map<String, Boolean>> clearSession(
            @PathVariable String sessionId) {
        sessionStore.clearSession(sessionId);
        return ResponseEntity.ok(Map.of("cleared", true));
    }
}