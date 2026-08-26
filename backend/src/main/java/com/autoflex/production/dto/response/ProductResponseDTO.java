package com.autoflex.production.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record ProductResponseDTO(
        Long id,
        String name,
        BigDecimal value,
        List<ProductComponentResponseDTO> components
) {}
