package com.PrizmaGold.model;

import java.util.List;
import java.util.Map;

public class PythonRequest {
    private String prompt;
    private List<Message> history;
    private Map<String, Object> currentSpecs;

    public PythonRequest() {}

    public PythonRequest(String prompt, List<Message> history, Map<String, Object> currentSpecs) {
        this.prompt = prompt;
        this.history = history;
        this.currentSpecs = currentSpecs;
    }

    // Getters and Setters
    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    public List<Message> getHistory() { return history; }
    public void setHistory(List<Message> history) { this.history = history; }

    public Map<String, Object> getCurrentSpecs() { return currentSpecs; }
    public void setCurrentSpecs(Map<String, Object> currentSpecs) { this.currentSpecs = currentSpecs; }
}