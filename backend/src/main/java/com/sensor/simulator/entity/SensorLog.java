package com.sensor.simulator.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_logs")
public class SensorLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sensorId = "SENSOR_ALPHA_01";

    @Column(nullable = false)
    private String state; // "ON" or "OFF"

    @Column(nullable = false)
    private LocalDateTime recordedAt;

    private Long durationSeconds; // Duration in ON state before turning OFF, or session duration

    private String triggeredBy; // email or username or "SYSTEM"

    private Double temperature;

    private Double vibration;

    private Integer batteryLevel;

    private String statusMessage;

    public SensorLog() {}

    public SensorLog(String sensorId, String state, LocalDateTime recordedAt, Long durationSeconds, String triggeredBy, Double temperature, Double vibration, Integer batteryLevel, String statusMessage) {
        this.sensorId = sensorId;
        this.state = state;
        this.recordedAt = recordedAt;
        this.durationSeconds = durationSeconds;
        this.triggeredBy = triggeredBy;
        this.temperature = temperature;
        this.vibration = vibration;
        this.batteryLevel = batteryLevel;
        this.statusMessage = statusMessage;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSensorId() {
        return sensorId;
    }

    public void setSensorId(String sensorId) {
        this.sensorId = sensorId;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    public Long getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Long durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public String getTriggeredBy() {
        return triggeredBy;
    }

    public void setTriggeredBy(String triggeredBy) {
        this.triggeredBy = triggeredBy;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getVibration() {
        return vibration;
    }

    public void setVibration(Double vibration) {
        this.vibration = vibration;
    }

    public Integer getBatteryLevel() {
        return batteryLevel;
    }

    public void setBatteryLevel(Integer batteryLevel) {
        this.batteryLevel = batteryLevel;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }
}
