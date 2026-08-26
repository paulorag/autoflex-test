package com.autoflex.production.mapper;

import com.autoflex.production.domain.RawMaterial;
import com.autoflex.production.dto.request.RawMaterialRequestDTO;
import com.autoflex.production.dto.response.RawMaterialResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class RawMaterialMapper {

    public RawMaterial toEntity(RawMaterialRequestDTO dto) {
        if (dto == null) return null;
        return RawMaterial.builder()
                .name(dto.name() != null ? dto.name().trim() : null)
                .stockQuantity(dto.stockQuantity())
                .build();
    }

    public void updateEntityFromDto(RawMaterial entity, RawMaterialRequestDTO dto) {
        if (entity == null || dto == null) return;
        if (dto.name() != null) {
            entity.setName(dto.name().trim());
        }
        if (dto.stockQuantity() != null) {
            entity.setStockQuantity(dto.stockQuantity());
        }
    }

    public RawMaterialResponseDTO toResponseDTO(RawMaterial entity) {
        if (entity == null) return null;
        return new RawMaterialResponseDTO(
                entity.getId(),
                entity.getName(),
                entity.getStockQuantity()
        );
    }
}
