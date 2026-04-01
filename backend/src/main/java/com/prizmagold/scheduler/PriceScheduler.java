package com.prizmagold.scheduler;

import com.prizmagold.service.GoldApiService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PriceScheduler {

    private final GoldApiService goldApiService;

    public PriceScheduler(GoldApiService goldApiService) {
        this.goldApiService = goldApiService;
    }

    // Every day at 09:00
    @Scheduled(cron = "0 0 9 * * *")
    public void collectDailyPrice() {
        try {
            var saved = goldApiService.fetchAndSave();
            System.out.println("✅ Gold price saved: $" + saved.getPriceUsd());
        } catch (Exception e) {
            System.err.println("❌ Scheduler failed: " + e.getMessage());
        }
    }
}