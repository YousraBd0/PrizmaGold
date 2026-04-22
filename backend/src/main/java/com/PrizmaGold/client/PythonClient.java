package com.PrizmaGold.client;

import com.PrizmaGold.model.PythonRequest;
import com.PrizmaGold.model.PythonResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

@Component
public class PythonClient {

    private final RestTemplate restTemplate;
    private static final String PYTHON_URL = "http://localhost:8000/api/generate";

    public PythonClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public PythonResponse callPythonService(PythonRequest request) {
        try {
            ResponseEntity<PythonResponse> response = restTemplate.postForEntity(
                PYTHON_URL,
                request,
                PythonResponse.class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Python AI service unavailable: " + e.getMessage());
        }
    }
}