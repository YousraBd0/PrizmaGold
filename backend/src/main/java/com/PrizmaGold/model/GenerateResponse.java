package com.PrizmaGold.model;

import java.util.Map;

public class GenerateResponse {
    private String reply;
    private Map<String, Object> specs;
    private String modelUrl;

    public GenerateResponse() {}

    public GenerateResponse(String reply, Map<String, Object> specs, String modelUrl) {
        this.reply = reply;
        this.specs = specs;
        this.modelUrl = modelUrl;
    }

    // Getters and Setters
    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }

    public Map<String, Object> getSpecs() { return specs; }
    public void setSpecs(Map<String, Object> specs) { this.specs = specs; }

    public String getModelUrl() { return modelUrl; }
    public void setModelUrl(String modelUrl) { this.modelUrl = modelUrl; }
}