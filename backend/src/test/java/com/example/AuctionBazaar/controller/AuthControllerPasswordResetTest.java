package com.example.AuctionBazaar.controller;

import com.example.AuctionBazaar.DTO.ChangePasswordRequest;
import com.example.AuctionBazaar.DTO.ForgotPasswordRequest;
import com.example.AuctionBazaar.DTO.ResetPasswordRequest;
import com.example.AuctionBazaar.Model.User;
import com.example.AuctionBazaar.repository.UserRepository;
import com.example.AuctionBazaar.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.sql.Timestamp;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerPasswordResetTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    private AuthController controller;

    @BeforeEach
    void setUp() {
        controller = new AuthController();
        ReflectionTestUtils.setField(controller, "userRepository", userRepository);
        ReflectionTestUtils.setField(controller, "emailService", emailService);
        ReflectionTestUtils.setField(controller, "frontendUrl", "http://localhost:3000");
    }

    @Test
    void forgotPasswordSendsExpiringLinkAndStoresToken() {
        User user = new User();
        user.setEmail("bidder@example.com");
        when(userRepository.findByEmail("bidder@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("bidder@example.com");
        ResponseEntity<?> response = controller.forgotPassword(request);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(user.getResetToken());
        assertTrue(user.getTokenExpiry().after(new Timestamp(System.currentTimeMillis())));
        ArgumentCaptor<String> body = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendEmail(eq("bidder@example.com"), anyString(), body.capture());
        assertTrue(body.getValue().contains("http://localhost:3000/reset-password?token=" + user.getResetToken()));
        verify(userRepository).save(user);
    }

    @Test
    void forgotPasswordReturnsSameMessageForUnknownEmail() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("unknown@example.com");

        ResponseEntity<?> response = controller.forgotPassword(request);

        assertEquals(200, response.getStatusCode().value());
        verifyNoInteractions(emailService);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void resetPasswordUpdatesHashAndConsumesToken() {
        User user = new User();
        user.setResetToken("valid-token");
        user.setTokenExpiry(new Timestamp(System.currentTimeMillis() + 60_000));
        when(userRepository.findByResetToken("valid-token")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token");
        request.setNewPassword("a-new-password");

        ResponseEntity<String> response = controller.resetPassword(request);

        assertEquals(200, response.getStatusCode().value());
        assertTrue(org.springframework.security.crypto.bcrypt.BCrypt.checkpw("a-new-password", user.getPasswordHash()));
        assertNull(user.getResetToken());
        assertNull(user.getTokenExpiry());
    }

    @Test
    void changePasswordRequiresCurrentPasswordAndUpdatesCredential() {
        User user = new User();
        user.setId(7);
        user.setPasswordHash(org.springframework.security.crypto.bcrypt.BCrypt.hashpw("old-password", org.springframework.security.crypto.bcrypt.BCrypt.gensalt()));
        when(userRepository.findById(7)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setUserId(7);
        request.setCurrentPassword("old-password");
        request.setNewPassword("brand-new-password");

        ResponseEntity<String> response = controller.changePassword(request);

        assertEquals(200, response.getStatusCode().value());
        assertTrue(org.springframework.security.crypto.bcrypt.BCrypt.checkpw("brand-new-password", user.getPasswordHash()));
    }
}
