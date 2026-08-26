package com.autoflex.production.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record ProductRequestDTO(
        @NotBlank(message = "O nome do produto é obrigatório")
        @Size(max = 150, message = "O nome do produto deve ter no máximo 150 caracteres")
        String name,

        @NotNull(message = "O valor de venda é obrigatório")
        @Positive(message = "O valor de venda deve ser maior que zero")
        BigDecimal value,

        @NotEmpty(message = "O produto deve conter ao menos um ingrediente na receita")
        List<@Valid ProductComponentRequestDTO> components
) {}
