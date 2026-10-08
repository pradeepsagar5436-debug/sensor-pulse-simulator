package com.sensor.simulator.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:tharunvarun556@gmail.com}")
    private String fromEmail;

    /**
     * Core async email dispatch. Runs in a background thread so the HTTP response
     * is returned immediately without waiting for SMTP round-trip.
     */
    @Async
    public void sendEmail(String to, String subject, String body) {
        logger.info("Async email dispatch started for: {}", to);

        if (mailSender == null) {
            logger.warn("JavaMailSender bean is not configured! Cannot dispatch real email.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);

            logger.info("\n==================== [EMAIL DISPATCHED] ====================\n" +
                    "To:      {}\nFrom:    {}\nSubject: {}\nBody:\n{}\n" +
                    "============================================================", to, fromEmail, subject, body);
        } catch (Exception e) {
            logger.error("Async email dispatch FAILED to {}: {}", to, e.getMessage(), e);
            // Do NOT rethrow — async method; caller is already done
        }
    }

    public void sendWelcomeAndVerificationEmail(String to, String fullName, String verificationCode) {
        String subject = "Welcome to Sensor Simulator - Account Registration";
        String body = "Hello " + fullName + ",\n\n"
                + "Welcome to the Sensor Detection & Telemetry Simulation Platform!\n\n"
                + "Your account has been successfully created. You can now log in to the interactive dashboard.\n"
                + "Verification Code: " + verificationCode + "\n\n"
                + "Explore sensor switches, monitor live telemetry, and analyze historical data.\n\n"
                + "Best Regards,\n"
                + "Sensor Simulator Team";
        sendEmail(to, subject, body);
    }

    public void sendPasswordResetEmail(String to, String resetToken) {
        String subject = "Password Reset Request - Sensor Simulator";
        String body = "Hello,\n\n"
                + "We received a request to reset your password for your Sensor Simulator account.\n\n"
                + "Your Password Reset OTP / Code is:\n"
                + ">> " + resetToken + " <<\n\n"
                + "Use this code on the Reset Password page to configure your new password.\n"
                + "This code will expire in 15 minutes.\n\n"
                + "If you did not make this request, please ignore this email.\n\n"
                + "Best Regards,\n"
                + "Sensor Simulator Security Team";
        sendEmail(to, subject, body);
    }

    public void sendPasswordChangedAlert(String to, String fullName) {
        String subject = "Security Alert: Password Changed";
        String body = "Hello " + fullName + ",\n\n"
                + "Your Sensor Simulator account password was recently changed.\n\n"
                + "If this was you, you can safely disregard this message.\n"
                + "If you did not initiate this change, please contact support immediately.\n\n"
                + "Best Regards,\n"
                + "Sensor Simulator Security Team";
        sendEmail(to, subject, body);
    }
}
