package com.autoflex.production.service;

import com.autoflex.production.domain.Product;
import com.autoflex.production.domain.ProductComponent;
import com.autoflex.production.domain.RawMaterial;
import com.autoflex.production.dto.request.ProductComponentRequestDTO;
import com.autoflex.production.dto.request.ProductRequestDTO;
import com.autoflex.production.dto.response.ProductResponseDTO;
import com.autoflex.production.exception.BusinessRuleException;
import com.autoflex.production.exception.ResourceNotFoundException;
import com.autoflex.production.mapper.ProductMapper;
import com.autoflex.production.repository.ProductRepository;
import com.autoflex.production.repository.RawMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final ProductMapper productMapper;

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> findAll() {
        return productRepository.findAll().stream()
                .map(productMapper::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponseDTO findById(Long id) {
        return productRepository.findById(id)
                .map(productMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com o ID: " + id));
    }

    @Transactional
    public ProductResponseDTO create(ProductRequestDTO requestDTO) {
        Map<Long, RawMaterial> rawMaterialsMap = loadAndValidateRawMaterials(requestDTO);

        Product product = productMapper.toEntity(requestDTO, rawMaterialsMap);
        Product saved = productRepository.save(product);

        return productMapper.toResponseDTO(saved);
    }

    @Transactional
    public ProductResponseDTO update(Long id, ProductRequestDTO requestDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com o ID: " + id));

        Map<Long, RawMaterial> rawMaterialsMap = loadAndValidateRawMaterials(requestDTO);

        product.setName(requestDTO.name().trim());
        product.setValue(requestDTO.value());

        // Limpa componentes existentes para atualizar a receita de forma consistente
        product.getComponents().clear();

        if (requestDTO.components() != null) {
            for (ProductComponentRequestDTO compDto : requestDTO.components()) {
                RawMaterial rawMaterial = rawMaterialsMap.get(compDto.rawMaterialId());
                ProductComponent component = ProductComponent.builder()
                        .product(product)
                        .rawMaterial(rawMaterial)
                        .quantityRequired(compDto.quantityRequired())
                        .build();
                product.addComponent(component);
            }
        }

        Product updated = productRepository.save(product);
        return productMapper.toResponseDTO(updated);
    }

    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Produto não encontrado com o ID: " + id);
        }
        productRepository.deleteById(id);
    }

    private Map<Long, RawMaterial> loadAndValidateRawMaterials(ProductRequestDTO requestDTO) {
        if (requestDTO.components() == null || requestDTO.components().isEmpty()) {
            throw new BusinessRuleException("O produto deve conter ao menos uma matéria-prima em sua composição.");
        }

        Set<Long> rawMaterialIds = requestDTO.components().stream()
                .map(ProductComponentRequestDTO::rawMaterialId)
                .collect(Collectors.toSet());

        List<RawMaterial> rawMaterials = rawMaterialRepository.findAllById(rawMaterialIds);
        Map<Long, RawMaterial> rawMaterialsMap = rawMaterials.stream()
                .collect(Collectors.toMap(RawMaterial::getId, Function.identity()));

        for (Long rawMaterialId : rawMaterialIds) {
            if (!rawMaterialsMap.containsKey(rawMaterialId)) {
                throw new ResourceNotFoundException("Matéria-prima com ID " + rawMaterialId + " não foi encontrada.");
            }
        }

        return rawMaterialsMap;
    }
}