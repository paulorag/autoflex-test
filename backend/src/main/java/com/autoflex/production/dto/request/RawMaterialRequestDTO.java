package com.autoflex.production.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record RawMaterialRequestDTO(
        @NotBlank(message = "O nome da matéria-prima é obrigatório")
        @Size(max = 150, message = "O nome da matéria-prima deve ter no máximo 150 caracteres")
        String name,

        @NotNull(message = "A quantidade de estoque é obrigatória")
        @PositiveOrZero(message = "A quantidade de estoque não pode ser negativa")
        Integer stockQuantity
) {}
