package com.sensor.simulator.service;

import com.sensor.simulator.config.JwtTokenProvider;
import com.sensor.simulator.dto.*;
import com.sensor.simulator.entity.PasswordResetToken;
import com.sensor.simulator.entity.RefreshToken;
import com.sensor.simulator.entity.User;
import com.sensor.simulator.repository.PasswordResetTokenRepository;
import com.sensor.simulator.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final UserService userService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       RefreshTokenService refreshTokenService,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       EmailService emailService,
                       UserService userService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.refreshTokenService = refreshTokenService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
        this.userService = userService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new RuntimeException("Email is already registered: " + request.getEmail());
        }

        User user = new User(
                request.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName().trim(),
                request.getPhone()
        );

        User savedUser = userRepository.save(user);

        // Generate 6-digit welcome verification code & send email
        String verificationCode = String.format("%06d", new Random().nextInt(999999));
        emailService.sendWelcomeAndVerificationEmail(savedUser.getEmail(), savedUser.getFullName(), verificationCode);

        // Generate JWT Access Token and Refresh Token
        String accessToken = tokenProvider.generateAccessToken(savedUser.getEmail(), savedUser.getRole());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser);

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                tokenProvider.getAccessTokenExpirationMs(),
                userService.mapToProfile(savedUser)
        );
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.isEnabled()) {
            throw new RuntimeException("Your account is disabled. Please contact support.");
        }

        String accessToken = tokenProvider.generateAccessToken(user.getEmail(), user.getRole());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                tokenProvider.getAccessTokenExpirationMs(),
                userService.mapToProfile(user)
        );
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken token = refreshTokenService.findByToken(request.getRefreshToken())
                .map(refreshTokenService::verifyExpiration)
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database or expired"));

        User user = token.getUser();
        String newAccessToken = tokenProvider.generateAccessToken(user.getEmail(), user.getRole());

        return new AuthResponse(
                newAccessToken,
                token.getToken(),
                tokenProvider.getAccessTokenExpirationMs(),
                userService.mapToProfile(user)
        );
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // 6-digit OTP code for ease of use
            String otpCode = String.format("%06d", 100000 + new Random().nextInt(900000));

            PasswordResetToken resetToken = passwordResetTokenRepository.findByUser(user)
                    .orElse(new PasswordResetToken());

            resetToken.setUser(user);
            resetToken.setToken(otpCode);
            // 15 minutes expiration
            resetToken.setExpiryDate(Instant.now().plusSeconds(900));
            resetToken.setUsed(false);
            passwordResetTokenRepository.save(resetToken);

            emailService.sendPasswordResetEmail(user.getEmail(), otpCode);
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken().trim())
                .orElseThrow(() -> new RuntimeException("Invalid or expired password reset token"));

        if (resetToken.isUsed() || resetToken.getExpiryDate().isBefore(Instant.now())) {
            throw new RuntimeException("Reset token has already been used or has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        emailService.sendPasswordChangedAlert(user.getEmail(), user.getFullName());
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        emailService.sendPasswordChangedAlert(user.getEmail(), user.getFullName());
    }
}
