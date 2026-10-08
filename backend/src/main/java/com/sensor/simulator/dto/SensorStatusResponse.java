package com.sensor.simulator.dto;

import java.time.LocalDateTime;

public class SensorStatusResponse {
    private String sensorId;
    private String currentState; // "ON" or "OFF"
    private LocalDateTime lastSwitchedAt;
    private Long currentDurationSeconds;
    private long totalSwitches;
    private long totalOnCount;
    private long totalOffCount;
    private long totalActiveSeconds;
    private String uptimeFormatted;
    private Double lastTemperature;
    private Double lastVibration;
    private Integer lastBatteryLevel;
    private String lastTriggeredBy;

    public SensorStatusResponse() {}

    public String getSensorId() {
        return sensorId;
    }

    public void setSensorId(String sensorId) {
        this.sensorId = sensorId;
    }

    public String getCurrentState() {
        return currentState;
    }

    public void setCurrentState(String currentState) {
        this.currentState = currentState;
    }

    public LocalDateTime getLastSwitchedAt() {
        return lastSwitchedAt;
    }

    public void setLastSwitchedAt(LocalDateTime lastSwitchedAt) {
        this.lastSwitchedAt = lastSwitchedAt;
    }

    public Long getCurrentDurationSeconds() {
        return currentDurationSeconds;
    }

    public void setCurrentDurationSeconds(Long currentDurationSeconds) {
        this.currentDurationSeconds = currentDurationSeconds;
    }

    public long getTotalSwitches() {
        return totalSwitches;
    }

    public void setTotalSwitches(long totalSwitches) {
        this.totalSwitches = totalSwitches;
    }

    public long getTotalOnCount() {
        return totalOnCount;
    }

    public void setTotalOnCount(long totalOnCount) {
        this.totalOnCount = totalOnCount;
    }

    public long getTotalOffCount() {
        return totalOffCount;
    }

    public void setTotalOffCount(long totalOffCount) {
        this.totalOffCount = totalOffCount;
    }

    public long getTotalActiveSeconds() {
        return totalActiveSeconds;
    }

    public void setTotalActiveSeconds(long totalActiveSeconds) {
        this.totalActiveSeconds = totalActiveSeconds;
    }

    public String getUptimeFormatted() {
        return uptimeFormatted;
    }

    public void setUptimeFormatted(String uptimeFormatted) {
        this.uptimeFormatted = uptimeFormatted;
    }

    public Double getLastTemperature() {
        return lastTemperature;
    }

    public void setLastTemperature(Double lastTemperature) {
        this.lastTemperature = lastTemperature;
    }

    public Double getLastVibration() {
        return lastVibration;
    }

    public void setLastVibration(Double lastVibration) {
        this.lastVibration = lastVibration;
    }

    public Integer getLastBatteryLevel() {
        return lastBatteryLevel;
    }

    public void setBatteryLevel(Integer lastBatteryLevel) {
        this.lastBatteryLevel = lastBatteryLevel;
    }

    public String getLastTriggeredBy() {
        return lastTriggeredBy;
    }

    public void setLastTriggeredBy(String lastTriggeredBy) {
        this.lastTriggeredBy = lastTriggeredBy;
    }
}
