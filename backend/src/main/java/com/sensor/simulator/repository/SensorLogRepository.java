package com.sensor.simulator.repository;

import com.sensor.simulator.entity.SensorLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SensorLogRepository extends JpaRepository<SensorLog, Long> {

    Optional<SensorLog> findTopBySensorIdOrderByRecordedAtDesc(String sensorId);

    List<SensorLog> findTop50ByOrderByRecordedAtDesc();

    Page<SensorLog> findAllByOrderByRecordedAtDesc(Pageable pageable);

    long countByState(String state);

    long countByRecordedAtAfter(LocalDateTime dateTime);
}
