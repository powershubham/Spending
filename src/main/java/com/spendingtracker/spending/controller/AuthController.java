package com.spendingtracker.spending.controller;

import com.spendingtracker.spending.dto.*;
import com.spendingtracker.spending.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
//@CrossOrigin(origins = "http://127.0.0.1:5500")
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody RegisterRequest request){

        String message = authService.register(request);

        Map<String, String> response = new HashMap<>();
        response.put("message", message);

        return response;
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody LoginRequest request){

        String token = authService.login(request);

        Map<String, String> response = new HashMap<>();
        response.put("token", token);

        return response;
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam String email) {

        return authService.sendOtp(email);
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request) {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return ResponseEntity.ok(
                authService.changePassword(request, email)
        );
    }
}