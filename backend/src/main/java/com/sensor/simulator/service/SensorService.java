package com.sensor.simulator.service;

import com.sensor.simulator.dto.SensorStatusResponse;
import com.sensor.simulator.dto.SensorToggleRequest;
import com.sensor.simulator.entity.SensorLog;
import com.sensor.simulator.repository.SensorLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SensorService {

    private final SensorLogRepository sensorLogRepository;

    public SensorService(SensorLogRepository sensorLogRepository) {
        this.sensorLogRepository = sensorLogRepository;
    }

    @Transactional
    public SensorLog toggleSensor(SensorToggleRequest request, String triggeredBy) {
        String sensorId = request.getSensorId() != null ? request.getSensorId() : "SENSOR_ALPHA_01";
        String requestedAction = request.getAction().toUpperCase();

        LocalDateTime now = LocalDateTime.now();
        Optional<SensorLog> latestLogOpt = sensorLogRepository.findTopBySensorIdOrderByRecordedAtDesc(sensorId);

        Long durationSeconds = 0L;
        if (latestLogOpt.isPresent()) {
            SensorLog previousLog = latestLogOpt.get();
            durationSeconds = Duration.between(previousLog.getRecordedAt(), now).getSeconds();
        }

        // Generate realistic simulated values if not provided
        Double temperature = request.getTemperature();
        if (temperature == null) {
            temperature = "ON".equalsIgnoreCase(requestedAction) ? 42.5 + (Math.random() * 8.0) : 24.0 + (Math.random() * 2.0);
            temperature = Math.round(temperature * 10.0) / 10.0;
        }

        Double vibration = request.getVibration();
        if (vibration == null) {
            vibration = "ON".equalsIgnoreCase(requestedAction) ? 2.4 + (Math.random() * 3.5) : 0.05 + (Math.random() * 0.1);
            vibration = Math.round(vibration * 100.0) / 100.0;
        }

        Integer battery = request.getBatteryLevel();
        if (battery == null) {
            battery = 94 - (int) (Math.random() * 5);
        }

        String statusMsg = request.getStatusMessage();
        if (statusMsg == null || statusMsg.isBlank()) {
            statusMsg = "ON".equalsIgnoreCase(requestedAction)
                    ? "Sensor turned ON. Active telemetry transmission initiated."
                    : "Sensor turned OFF. Device entering low-power standby mode.";
        }

        SensorLog newLog = new SensorLog(
                sensorId,
                requestedAction,
                now,
                durationSeconds,
                triggeredBy != null ? triggeredBy : "ANONYMOUS",
                temperature,
                vibration,
                battery,
                statusMsg
        );

        return sensorLogRepository.save(newLog);
    }

    public SensorStatusResponse getStatus(String sensorId) {
        String targetSensorId = sensorId != null ? sensorId : "SENSOR_ALPHA_01";
        Optional<SensorLog> latestOpt = sensorLogRepository.findTopBySensorIdOrderByRecordedAtDesc(targetSensorId);

        SensorStatusResponse response = new SensorStatusResponse();
        response.setSensorId(targetSensorId);

        if (latestOpt.isPresent()) {
            SensorLog latest = latestOpt.get();
            response.setCurrentState(latest.getState());
            response.setLastSwitchedAt(latest.getRecordedAt());
            response.setCurrentDurationSeconds(Duration.between(latest.getRecordedAt(), LocalDateTime.now()).getSeconds());
            response.setLastTemperature(latest.getTemperature());
            response.setLastVibration(latest.getVibration());
            response.setBatteryLevel(latest.getBatteryLevel());
            response.setLastTriggeredBy(latest.getTriggeredBy());
        } else {
            // Default initial state
            response.setCurrentState("OFF");
            response.setLastSwitchedAt(LocalDateTime.now());
            response.setCurrentDurationSeconds(0L);
            response.setLastTemperature(24.5);
            response.setLastVibration(0.02);
            response.setBatteryLevel(100);
            response.setLastTriggeredBy("SYSTEM_INIT");
        }

        long totalSwitches = sensorLogRepository.count();
        long onCount = sensorLogRepository.countByState("ON");
        long offCount = sensorLogRepository.countByState("OFF");

        response.setTotalSwitches(totalSwitches);
        response.setTotalOnCount(onCount);
        response.setTotalOffCount(offCount);

        long activeSeconds = 0;
        List<SensorLog> logs = sensorLogRepository.findAll();
        for (SensorLog log : logs) {
            if ("OFF".equalsIgnoreCase(log.getState()) && log.getDurationSeconds() != null) {
                activeSeconds += log.getDurationSeconds();
            }
        }
        if ("ON".equalsIgnoreCase(response.getCurrentState()) && response.getCurrentDurationSeconds() != null) {
            activeSeconds += response.getCurrentDurationSeconds();
        }

        response.setTotalActiveSeconds(activeSeconds);
        response.setUptimeFormatted(formatDuration(activeSeconds));

        return response;
    }

    public List<SensorLog> getRecentLogs(int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 100);
        Page<SensorLog> page = sensorLogRepository.findAllByOrderByRecordedAtDesc(PageRequest.of(0, safeLimit));
        return page.getContent();
    }

    @Transactional
    public void clearLogs() {
        sensorLogRepository.deleteAll();
    }

    private String formatDuration(long seconds) {
        long hours = seconds / 3600;
        long minutes = (seconds % 3600) / 60;
        long secs = seconds % 60;
        return String.format("%02dh %02dm %02ds", hours, minutes, secs);
    }
}
