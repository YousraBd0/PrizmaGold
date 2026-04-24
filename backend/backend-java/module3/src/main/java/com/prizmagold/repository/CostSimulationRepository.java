package com.prizmagold.repository;

import com.prizmagold.entity.CostSimulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CostSimulationRepository extends JpaRepository<CostSimulation, UUID> {
}
