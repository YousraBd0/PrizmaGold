package com.prizmagold.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prizmagold.model.MetalPrice;
import com.prizmagold.repository.MetalPriceRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Service
public class GoldApiService {

    @Value("${goldapi.key}")
    private String goldApiKey;

    private final MetalPriceRepository repository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public GoldApiService(MetalPriceRepository repository) {
        this.repository = repository;
    }

    public MetalPrice fetchAndSave() throws Exception {
        // 1. Call GoldAPI
        String url = "https://www.goldapi.io/api/XAU/USD";

        HttpHeaders headers = new HttpHeaders();
        headers.set("x-access-token", goldApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<String> response = restTemplate.exchange(
            url, HttpMethod.GET,
            new HttpEntity<>(headers),
            String.class
        );

        String rawJson = response.getBody();

        // 2. Parse price
        JsonNode json = mapper.readTree(rawJson);
        BigDecimal price = json.get("price").decimalValue();

        // 3. Save to metal_prices table
        MetalPrice mp = new MetalPrice();
        mp.setMetalType("gold");
        mp.setPriceUsd(price);
        mp.setSourceApi("goldapi");
        mp.setRecordedAt(ZonedDateTime.now());
        mp.setIsDailySnapshot(true);
        mp.setRawResponse(rawJson);

        return repository.save(mp);
    }
}