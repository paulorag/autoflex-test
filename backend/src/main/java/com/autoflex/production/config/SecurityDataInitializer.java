package com.autoflex.production.config;

import com.autoflex.production.domain.Role;
import com.autoflex.production.domain.User;
import com.autoflex.production.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SecurityDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Inicializando usuários padrão de segurança (admin e operador)...");

            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .name("Administrador do Sistema")
                    .role(Role.ROLE_ADMIN)
                    .build();

            User operator = User.builder()
                    .username("operador")
                    .password(passwordEncoder.encode("operador123"))
                    .name("Operador de Fábrica")
                    .role(Role.ROLE_OPERATOR)
                    .build();

            userRepository.save(admin);
            userRepository.save(operator);

            log.info("Usuários padrão criados com sucesso: 'admin' (ADMIN) e 'operador' (OPERATOR).");
        }
    }
}
