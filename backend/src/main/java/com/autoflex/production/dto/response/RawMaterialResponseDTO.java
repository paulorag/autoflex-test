package com.autoflex.production.dto.response;

public record RawMaterialResponseDTO(
        Long id,
        String name,
        Integer stockQuantity
) {}
