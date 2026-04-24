package com.prizmagold.repository;

import com.prizmagold.model.MetalPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MetalPriceRepository extends JpaRepository<MetalPrice, Long> {

    // Latest 10 prices ordered by date
    List<MetalPrice> findTop10ByOrderByRecordedAtDesc();

    // Only daily snapshots for a specific metal
    List<MetalPrice> findByMetalTypeAndIsDailySnapshotTrueOrderByRecordedAtDesc(String metalType);
}