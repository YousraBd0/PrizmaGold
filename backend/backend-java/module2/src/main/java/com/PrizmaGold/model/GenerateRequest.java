package com.PrizmaGold.model;

import java.util.List;
import java.util.Map;

public class GenerateRequest {
    private String prompt;
    private String sessionId;
    private List<Message> history;
    private Map<String, Object> currentSpecs;

    // Getters and Setters
    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public List<Message> getHistory() { return history; }
    public void setHistory(List<Message> history) { this.history = history; }

    public Map<String, Object> getCurrentSpecs() { return currentSpecs; }
    public void setCurrentSpecs(Map<String, Object> currentSpecs) { this.currentSpecs = currentSpecs; }
}