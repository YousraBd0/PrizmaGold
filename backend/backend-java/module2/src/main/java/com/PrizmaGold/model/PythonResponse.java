package com.PrizmaGold.model;

public class PythonResponse {
    private String image_url;
    private String prompt_used;
    private String original_prompt;
    private String error;

    // Getters and Setters
    public String getImage_url() { return image_url; }
    public void setImage_url(String image_url) { this.image_url = image_url; }

    public String getPrompt_used() { return prompt_used; }
    public void setPrompt_used(String prompt_used) { this.prompt_used = prompt_used; }

    public String getOriginal_prompt() { return original_prompt; }
    public void setOriginal_prompt(String original_prompt) { this.original_prompt = original_prompt; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}