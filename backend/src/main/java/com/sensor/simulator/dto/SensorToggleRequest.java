package com.sensor.simulator.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class SensorToggleRequest {

    private String sensorId = "SENSOR_ALPHA_01";

    @NotBlank(message = "Action is required")
    @Pattern(regexp = "ON|OFF", message = "Action must be either ON or OFF")
    private String action;

    private Double temperature;

    private Double vibration;

    private Integer batteryLevel;

    private String statusMessage;

    public SensorToggleRequest() {}

    public SensorToggleRequest(String sensorId, String action, Double temperature, Double vibration, Integer batteryLevel, String statusMessage) {
        this.sensorId = sensorId;
        this.action = action;
        this.temperature = temperature;
        this.vibration = vibration;
        this.batteryLevel = batteryLevel;
        this.statusMessage = statusMessage;
    }

    public String getSensorId() {
        return sensorId;
    }

    public void setSensorId(String sensorId) {
        this.sensorId = sensorId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
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
