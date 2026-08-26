package com.autoflex.production.dto.response;

import java.math.BigDecimal;

public record ProductionOrderItemResponseDTO(
        Long id,
        Long productId,
        String productName,
        BigDecimal unitValue,
        Integer quantity,
        BigDecimal subtotal
) {}
