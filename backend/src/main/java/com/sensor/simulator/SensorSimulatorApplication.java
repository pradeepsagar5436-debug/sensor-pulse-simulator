package com.sensor.simulator;

import com.sensor.simulator.dto.SensorToggleRequest;
import com.sensor.simulator.entity.User;
import com.sensor.simulator.repository.UserRepository;
import com.sensor.simulator.service.SensorService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@EnableAsync
public class SensorSimulatorApplication {

    public static void main(String[] args) {
        SpringApplication.run(SensorSimulatorApplication.class, args);
        System.out.println("=================================================");
        System.out.println("🚀 Sensor Simulator Backend is RUNNING on port 8080!");
        System.out.println("📡 API Base URL: http://localhost:8080/api");
        System.out.println("📊 H2 Database Console: http://localhost:8080/h2-console");
        System.out.println("=================================================");
    }

    @Bean
    public CommandLineRunner initData(UserRepository userRepository,
                                      PasswordEncoder passwordEncoder,
                                      SensorService sensorService) {
        return args -> {
            String demoEmail = "admin@sensorsimulator.com";
            if (!userRepository.existsByEmail(demoEmail)) {
                User demoUser = new User(
                        demoEmail,
                        passwordEncoder.encode("Password123!"),
                        "Chief Telemetry Operator",
                        "+1 (555) 234-5678"
                );
                demoUser.setRole("ROLE_ADMIN");
                userRepository.save(demoUser);
                System.out.println(" seeded default demo account: " + demoEmail + " / Password123!");
            }

            // Seed initial sensor state if empty
            if (sensorService.getRecentLogs(1).isEmpty()) {
                SensorToggleRequest initLog = new SensorToggleRequest(
                        "SENSOR_ALPHA_01",
                        "OFF",
                        23.8,
                        0.02,
                        98,
                        "System initialized. Sensor standby mode engaged."
                );
                sensorService.toggleSensor(initLog, "SYSTEM_INIT");
                System.out.println(" seeded initial sensor state: SENSOR_ALPHA_01 [OFF]");
            }
        };
    }
}
