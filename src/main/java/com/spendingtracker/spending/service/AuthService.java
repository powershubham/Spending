package com.spendingtracker.spending.service;

import com.spendingtracker.spending.dto.ChangePasswordRequest;
import com.spendingtracker.spending.dto.LoginRequest;
import com.spendingtracker.spending.dto.RegisterRequest;
import com.spendingtracker.spending.dto.ResetPasswordRequest;
import com.spendingtracker.spending.entity.Otp;
import com.spendingtracker.spending.entity.User;
import com.spendingtracker.spending.repository.OtpRepository;
import com.spendingtracker.spending.repository.UserRepository;
import com.spendingtracker.spending.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpRepository otpRepository;

    public String register(RegisterRequest request){

        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());

        if(existingUser.isPresent()){
            return "User already exists";
        }

        User user = new User();
        user.setFirstname(request.getFirstname());
        user.setLastname(request.getLastname());
        user.setEmail(request.getEmail());

        // encrypt password
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);

        return "User registered successfully";
    }

    @Autowired
    private JwtService jwtService;

    public String login(LoginRequest request){

        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        if(userOptional.isEmpty()){
            return "Invalid email";
        }

        User user = userOptional.get();

        boolean passwordMatch =
                passwordEncoder.matches(request.getPassword(), user.getPassword());

        if(!passwordMatch){
            return "Invalid password";
        }

        String token = jwtService.generateToken(user.getEmail());

        return token;
    }

    public String changePassword(ChangePasswordRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }

        // Encode new password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);

        return "Password updated successfully";
    }

    public String sendOtp(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = String.valueOf((int)(Math.random() * 900000) + 100000);

        Otp otpEntity = new Otp();
        otpEntity.setEmail(email);
        otpEntity.setOtp(otp);
        otpEntity.setExpiryTime(System.currentTimeMillis() + 5 * 60 * 1000); // 5 min

        otpRepository.save(otpEntity);

        emailService.sendOtp(email, otp);

        return "OTP sent to email";
    }

    public String resetPassword(ResetPasswordRequest request) {

        Otp otpEntity = otpRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (!otpEntity.getOtp().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        if (otpEntity.getExpiryTime() < System.currentTimeMillis()) {
            throw new RuntimeException("OTP expired");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otpRepository.delete(otpEntity);

        return "Password reset successful";
    }
}