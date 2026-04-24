package com.PrizmaGold.repository;

import com.PrizmaGold.entity.Design;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DesignRepository extends JpaRepository<Design, UUID> {
}
