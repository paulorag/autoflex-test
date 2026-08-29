package com.autoflex.production.service;

import com.autoflex.production.domain.User;
import com.autoflex.production.dto.request.LoginRequestDTO;
import com.autoflex.production.dto.request.RegisterRequestDTO;
import com.autoflex.production.dto.response.AuthResponseDTO;
import com.autoflex.production.dto.response.UserResponseDTO;
import com.autoflex.production.exception.BusinessRuleException;
import com.autoflex.production.exception.ResourceNotFoundException;
import com.autoflex.production.repository.UserRepository;
import com.autoflex.production.security.JwtTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final AuthenticationManager authenticationManager;

    @Transactional(readOnly = true)
    public AuthResponseDTO login(LoginRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username().trim(),
                        request.password()
                )
        );

        User user = userRepository.findByUsername(request.username().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + request.username()));

        String token = jwtTokenService.generateToken(user);

        return new AuthResponseDTO(
                token,
                "Bearer",
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getRole(),
                jwtTokenService.getExpirationTime()
        );
    }

    @Transactional
    public UserResponseDTO register(RegisterRequestDTO request) {
        String username = request.username().trim();

        if (userRepository.existsByUsername(username)) {
            throw new BusinessRuleException("O nome de usuário '" + username + "' já está em uso.");
        }

        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(request.password()))
                .name(request.name().trim())
                .role(request.role())
                .build();

        User savedUser = userRepository.save(user);

        return new UserResponseDTO(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getName(),
                savedUser.getRole()
        );
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + username));

        return new UserResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getRole()
        );
    }
}
