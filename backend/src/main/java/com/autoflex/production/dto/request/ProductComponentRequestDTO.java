package com.autoflex.production.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ProductComponentRequestDTO(
        @NotNull(message = "O ID da matéria-prima é obrigatório")
        Long rawMaterialId,

        @NotNull(message = "A quantidade requerida é obrigatória")
        @Positive(message = "A quantidade requerida deve ser maior que zero")
        Integer quantityRequired
) {}
