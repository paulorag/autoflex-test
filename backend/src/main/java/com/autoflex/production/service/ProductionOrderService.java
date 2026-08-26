package com.autoflex.production.service;

import com.autoflex.production.domain.ProductionOrder;
import com.autoflex.production.dto.response.ProductionOrderItemResponseDTO;
import com.autoflex.production.dto.response.ProductionOrderResponseDTO;
import com.autoflex.production.exception.ResourceNotFoundException;
import com.autoflex.production.repository.ProductionOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionOrderService {

    private final ProductionOrderRepository repository;

    @Transactional(readOnly = true)
    public List<ProductionOrderResponseDTO> findAll() {
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductionOrderResponseDTO findById(Long id) {
        return repository.findById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de produção não encontrada com o ID: " + id));
    }

    private ProductionOrderResponseDTO toResponseDTO(ProductionOrder order) {
        List<ProductionOrderItemResponseDTO> itemDTOs = order.getItems().stream()
                .map(item -> new ProductionOrderItemResponseDTO(
                        item.getId(),
                        item.getProduct() != null ? item.getProduct().getId() : null,
                        item.getProductName(),
                        item.getUnitValue(),
                        item.getQuantity(),
                        item.getSubtotal()
                ))
                .toList();

        return new ProductionOrderResponseDTO(
                order.getId(),
                order.getCreatedAt(),
                order.getTotalValue(),
                order.getTotalItems(),
                order.getStatus(),
                itemDTOs
        );
    }
}
