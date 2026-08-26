package com.autoflex.production.dto.response;

public record ProductComponentResponseDTO(
        Long id,
        RawMaterialResponseDTO rawMaterial,
        Integer quantityRequired
) {}
