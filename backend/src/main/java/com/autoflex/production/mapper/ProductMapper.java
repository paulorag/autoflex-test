package com.autoflex.production.mapper;

import com.autoflex.production.domain.Product;
import com.autoflex.production.domain.ProductComponent;
import com.autoflex.production.domain.RawMaterial;
import com.autoflex.production.dto.request.ProductComponentRequestDTO;
import com.autoflex.production.dto.request.ProductRequestDTO;
import com.autoflex.production.dto.response.ProductComponentResponseDTO;
import com.autoflex.production.dto.response.ProductResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ProductMapper {

    private final RawMaterialMapper rawMaterialMapper;

    public Product toEntity(ProductRequestDTO dto, Map<Long, RawMaterial> rawMaterialsMap) {
        if (dto == null) return null;

        Product product = Product.builder()
                .name(dto.name() != null ? dto.name().trim() : null)
                .value(dto.value())
                .components(new ArrayList<>())
                .build();

        if (dto.components() != null) {
            for (ProductComponentRequestDTO compDto : dto.components()) {
                RawMaterial rawMaterial = rawMaterialsMap.get(compDto.rawMaterialId());
                if (rawMaterial != null) {
                    ProductComponent component = ProductComponent.builder()
                            .product(product)
                            .rawMaterial(rawMaterial)
                            .quantityRequired(compDto.quantityRequired())
                            .build();
                    product.addComponent(component);
                }
            }
        }

        return product;
    }

    public ProductResponseDTO toResponseDTO(Product entity) {
        if (entity == null) return null;

        List<ProductComponentResponseDTO> componentDTOs = new ArrayList<>();
        if (entity.getComponents() != null) {
            for (ProductComponent comp : entity.getComponents()) {
                componentDTOs.add(new ProductComponentResponseDTO(
                        comp.getId(),
                        rawMaterialMapper.toResponseDTO(comp.getRawMaterial()),
                        comp.getQuantityRequired()
                ));
            }
        }

        return new ProductResponseDTO(
                entity.getId(),
                entity.getName(),
                entity.getValue(),
                componentDTOs
        );
    }
}
