package com.autoflex.production.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProductionOrderResponseDTO(
        Long id,
        LocalDateTime createdAt,
        BigDecimal totalValue,
        Integer totalItems,
        String status,
        List<ProductionOrderItemResponseDTO> items
) {}
