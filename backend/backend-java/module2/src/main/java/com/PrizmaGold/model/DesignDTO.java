package com.PrizmaGold.model;

import lombok.Data;
import java.util.UUID;

@Data
public class DesignDTO {
    private String title;
    private String jewelryType;
    private String metalType;
    private String imageUrl;
    private UUID userId;
}
