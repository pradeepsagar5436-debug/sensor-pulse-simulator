package com.sensor.simulator.controller;

import com.sensor.simulator.dto.ApiResponse;
import com.sensor.simulator.dto.SensorStatusResponse;
import com.sensor.simulator.dto.SensorToggleRequest;
import com.sensor.simulator.entity.SensorLog;
import com.sensor.simulator.service.SensorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sensor")
public class SensorController {

    private final SensorService sensorService;

    public SensorController(SensorService sensorService) {
        this.sensorService = sensorService;
    }

    @PostMapping("/toggle")
    public ResponseEntity<ApiResponse<SensorLog>> toggleSensor(
            Authentication authentication,
            @Valid @RequestBody SensorToggleRequest request) {
        String triggeredBy = (authentication != null && authentication.getName() != null)
                ? authentication.getName()
                : "GUEST_OPERATOR";

        try {
            SensorLog log = sensorService.toggleSensor(request, triggeredBy);
            String message = String.format("Sensor %s switched to %s at %s",
                    log.getSensorId(), log.getState(), log.getRecordedAt());
            return ResponseEntity.ok(ApiResponse.ok(message, log));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<SensorStatusResponse>> getStatus(
            @RequestParam(defaultValue = "SENSOR_ALPHA_01") String sensorId) {
        try {
            SensorStatusResponse status = sensorService.getStatus(sensorId);
            return ResponseEntity.ok(ApiResponse.ok("Sensor status retrieved", status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<SensorLog>>> getHistory(
            @RequestParam(defaultValue = "50") int limit) {
        try {
            List<SensorLog> logs = sensorService.getRecentLogs(limit);
            return ResponseEntity.ok(ApiResponse.ok("Sensor logs retrieved", logs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/history")
    public ResponseEntity<ApiResponse<String>> clearHistory(Authentication authentication) {
        try {
            sensorService.clearLogs();
            return ResponseEntity.ok(ApiResponse.ok("Sensor history cleared successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
