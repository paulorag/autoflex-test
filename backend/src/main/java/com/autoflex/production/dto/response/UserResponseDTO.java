package com.autoflex.production.dto.response;

import com.autoflex.production.domain.Role;

public record UserResponseDTO(
        Long id,
        String username,
        String name,
        Role role
) {}
