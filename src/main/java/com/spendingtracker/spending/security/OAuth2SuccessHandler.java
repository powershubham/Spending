package com.spendingtracker.spending.security;

import com.spendingtracker.spending.entity.User;
import com.spendingtracker.spending.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException; // ✅ CORRECT IMPORT
import java.util.Optional;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException { // ✅ FIXED

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");

        Optional<User> userOptional = userRepository.findByEmail(email);

        User user;

        if (userOptional.isEmpty()) {

            user = new User();
            user.setEmail(email);
            user.setFirstname(oAuth2User.getAttribute("given_name"));
            user.setLastname(oAuth2User.getAttribute("family_name"));
            user.setProvider("GOOGLE");
            user.setPassword(null);

            userRepository.save(user);

        } else {
            user = userOptional.get();
        }

        String token = jwtService.generateToken(user.getEmail());
        String redirectUrl = "https://spending-h227.onrender.com/oauth-success.html?token=" + token;

        clearAuthenticationAttributes(request);
        response.sendRedirect(redirectUrl);
    }
}