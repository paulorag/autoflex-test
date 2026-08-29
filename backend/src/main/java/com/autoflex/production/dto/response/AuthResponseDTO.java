package com.autoflex.production.dto.response;

import com.autoflex.production.domain.Role;

public record AuthResponseDTO(
        String token,
        String tokenType,
        Long id,
        String username,
        String name,
        Role role,
        Long expiresIn
) {}
