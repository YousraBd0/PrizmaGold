package com.prizmagold;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling   // activates the daily scheduler
public class PrizmaGoldApplication {
    public static void main(String[] args) {
        SpringApplication.run(PrizmaGoldApplication.class, args);
    }
}