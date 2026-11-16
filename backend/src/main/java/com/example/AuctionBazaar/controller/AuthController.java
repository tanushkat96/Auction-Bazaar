package com.example.AuctionBazaar.controller;

import com.example.AuctionBazaar.DTO.*;
import com.example.AuctionBazaar.Model.User;
import com.example.AuctionBazaar.repository.UserRepository;
import com.example.AuctionBazaar.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    private final SecureRandom secureRandom = new SecureRandom();

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        String message = "If an account exists for that email, a password reset link has been sent.";
        Map<String, String> response = Map.of("message", message);
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.ok(response);
        }

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail().trim());
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(response);
        }

        User user = userOpt.get();
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
        Timestamp expiry = new Timestamp(System.currentTimeMillis() + 30L * 60 * 1000);
        String resetUrl = frontendUrl.replaceAll("/$", "") + "/reset-password?token=" + token;

        try {
            emailService.sendEmail(user.getEmail(), "Reset your AuctionBazaar password",
                    "We received a request to reset your password. Use this link within 30 minutes:\n\n"
                            + resetUrl + "\n\nIf you did not request this, you can ignore this email.");
            user.setResetToken(token);
            user.setTokenExpiry(expiry);
            userRepository.save(user);
        } catch (RuntimeException exception) {
            user.setResetToken(null);
            user.setTokenExpiry(null);
            userRepository.save(user);
            throw exception;
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signup(@RequestBody SignupRequest signupRequest) {
        Map<String, String> response = new HashMap<>();

        // Check if user already exists
        if (userRepository.findByEmail(signupRequest.getEmail()).isPresent()) {
            response.put("message", "Email already exists.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPasswordHash(BCrypt.hashpw(signupRequest.getPassword(), BCrypt.gensalt())); // Password hashing
        user.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        userRepository.save(user);

        response.put("message", "User registered successfully.");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }



    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody LoginRequest loginRequest) {
        // Check if the user exists
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());

        if (userOpt.isEmpty()) {
            // Return a JSON object with "error"
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "User not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorResponse);
        }

        User user = userOpt.get();
        if (BCrypt.checkpw(loginRequest.getPassword(), user.getPasswordHash())) {
            // Password matched
            user.setIsLoggedin(true);
            user.setLastLogin(new Timestamp(System.currentTimeMillis()));
            userRepository.save(user);

            // Return the user object (excluding sensitive fields like passwordHash)
            Map<String, Object> userResponse = new HashMap<>();
            userResponse.put("id", user.getId());
            userResponse.put("email", user.getEmail());
            userResponse.put("username", user.getUsername());
            userResponse.put("lastLogin", user.getLastLogin());
            userResponse.put("isLoggedin", user.getIsLoggedin());
            userResponse.put("createdAt", user.getCreatedAt());
            userResponse.put("userId", user.getUserId());
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(userResponse);
        } else {
            // Password didn't match
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid credentials.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorResponse);
        }
    }



    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest resetPasswordRequest) {

        if (resetPasswordRequest == null || resetPasswordRequest.getToken() == null
                || resetPasswordRequest.getNewPassword() == null
                || resetPasswordRequest.getNewPassword().length() < 8) {
            return ResponseEntity.badRequest().body("Enter a valid reset link and a password with at least 8 characters.");
        }

        Optional<User> userOpt = userRepository.findByResetToken(resetPasswordRequest.getToken());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid reset token.");
        }

        User user = userOpt.get();
        if (user.getTokenExpiry() == null || user.getTokenExpiry().before(new Timestamp(System.currentTimeMillis()))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Reset token expired.");
        }

        user.setPasswordHash(BCrypt.hashpw(resetPasswordRequest.getNewPassword(), BCrypt.gensalt()));
        user.setResetToken(null);
        user.setTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok("Password reset successfully.");
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest request) {
        if (request == null || request.getUserId() <= 0 || request.getCurrentPassword() == null
                || request.getNewPassword() == null || request.getNewPassword().length() < 8) {
            return ResponseEntity.badRequest().body("Enter your current password and a new password with at least 8 characters.");
        }

        Optional<User> userOpt = userRepository.findById(request.getUserId());
        if (userOpt.isEmpty() || !BCrypt.checkpw(request.getCurrentPassword(), userOpt.get().getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Current password is incorrect.");
        }

        User user = userOpt.get();
        user.setPasswordHash(BCrypt.hashpw(request.getNewPassword(), BCrypt.gensalt()));
        userRepository.save(user);
        return ResponseEntity.ok("Password changed successfully.");
    }

    @GetMapping("/user-profile/{id}")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable int id) {
        Optional<User> userOpt = userRepository.findById(id);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        User user = userOpt.get();

        // Convert User entity to UserProfileResponse
        UserProfileResponse userProfileResponse = new UserProfileResponse();
        userProfileResponse.setId(user.getId());
        userProfileResponse.setUsername(user.getUsername());
        userProfileResponse.setEmail(user.getEmail());
        userProfileResponse.setCreatedAt(user.getCreatedAt());
        userProfileResponse.setLastLogin(user.getLastLogin());

        return ResponseEntity.ok(userProfileResponse);
    }

//    @PutMapping("/update-profile/{id}")
//    public ResponseEntity<Map<String, String>> updateProfile(@PathVariable int id, @RequestBody UpdateProfileRequest updateProfileRequest) {
//        Optional<User> userOpt = userRepository.findById(id);
//
//        if (userOpt.isEmpty()) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found."));
//        }
//
//        User user = userOpt.get();
//
//        // Update user fields from request body
//        user.setUsername(updateProfileRequest.getUsername());
//        user.setEmail(updateProfileRequest.getEmail());
//        user.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
//
//        userRepository.save(user);  // Save updated user details
//
//        return ResponseEntity.ok(Map.of("message", "Profile updated successfully."));
//    }


    @DeleteMapping("/delete-user/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable int id) {
        Optional<User> userOpt = userRepository.findById(id);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found."));
        }

        userRepository.deleteById(id);  // Delete user from the database

        return ResponseEntity.ok(Map.of("message", "User deleted successfully."));
    }


}
