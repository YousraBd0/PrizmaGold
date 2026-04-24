package com.prizmagold.repository;

import com.prizmagold.entity.EstimationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EstimationRepository extends JpaRepository<EstimationRecord, Long> {

    // Find all estimations for a specific client
    List<EstimationRecord> findByClientNameIgnoreCase(String clientName);

    // Find all estimations for a specific metal type
    List<EstimationRecord> findByMetalIgnoreCase(String metal);
}