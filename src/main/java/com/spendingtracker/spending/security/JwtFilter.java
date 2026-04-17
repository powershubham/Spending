package com.spendingtracker.spending.security;

import com.spendingtracker.spending.entity.User;
import com.spendingtracker.spending.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        // ✅ Skip public routes (VERY IMPORTANT)
        if (
                        path.equals("/") ||
                        path.endsWith(".html") ||     // 🔥 IMPORTANT FIX
                        path.endsWith(".js") ||
                        path.endsWith(".css") ||
                        path.endsWith(".png") ||
                        path.endsWith(".jpg") ||
                        path.equals("/favicon.ico")
        ) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        String email = null;
        String jwt = null;

        // ✅ Extract JWT token
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            email = jwtService.extractEmail(jwt);
        }

        // ✅ Validate and set authentication
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            Optional<User> userOptional = userRepository.findByEmail(email);

            if (userOptional.isPresent()) {

                User user = userOptional.get();

                if (jwtService.validateToken(jwt, user.getEmail())) {

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    user.getEmail(),
                                    null,
                                    java.util.Collections.emptyList() // ✅ FIX
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}