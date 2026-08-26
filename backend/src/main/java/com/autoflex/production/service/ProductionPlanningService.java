package com.autoflex.production.service;

import com.autoflex.production.domain.Product;
import com.autoflex.production.domain.ProductComponent;
import com.autoflex.production.domain.ProductionOrder;
import com.autoflex.production.domain.ProductionOrderItem;
import com.autoflex.production.domain.RawMaterial;
import com.autoflex.production.dto.ProductionPlanDTO;
import com.autoflex.production.dto.response.ProductionOrderItemResponseDTO;
import com.autoflex.production.dto.response.ProductionOrderResponseDTO;
import com.autoflex.production.exception.BusinessRuleException;
import com.autoflex.production.repository.ProductRepository;
import com.autoflex.production.repository.ProductionOrderRepository;
import com.autoflex.production.repository.RawMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductionPlanningService {

    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final ProductionOrderRepository productionOrderRepository;

    @Transactional(readOnly = true)
    public List<ProductionPlanDTO> calculateProductionPlan() {
        List<Product> products = productRepository.findAll();
        List<RawMaterial> rawMaterials = rawMaterialRepository.findAll();

        Map<Long, Integer> currentStock = new HashMap<>();
        for (RawMaterial rm : rawMaterials) {
            if (rm != null && rm.getId() != null) {
                currentStock.put(rm.getId(), rm.getStockQuantity() != null ? rm.getStockQuantity() : 0);
            }
        }

        // Ordena do maior para o menor valor, tratando eventuais valores nulos
        products.sort((p1, p2) -> {
            BigDecimal v1 = p1.getValue() != null ? p1.getValue() : BigDecimal.ZERO;
            BigDecimal v2 = p2.getValue() != null ? p2.getValue() : BigDecimal.ZERO;
            return v2.compareTo(v1);
        });

        List<ProductionPlanDTO> plan = new ArrayList<>();

        for (Product product : products) {
            if (product.getComponents() == null || product.getComponents().isEmpty() || product.getValue() == null) {
                continue;
            }

            int maxQuantityPossible = Integer.MAX_VALUE;
            boolean hasInvalidComponent = false;

            for (ProductComponent component : product.getComponents()) {
                if (component.getRawMaterial() == null || component.getRawMaterial().getId() == null) {
                    hasInvalidComponent = true;
                    break;
                }

                Integer requiredPerProduct = component.getQuantityRequired();
                if (requiredPerProduct == null || requiredPerProduct <= 0) {
                    hasInvalidComponent = true;
                    break;
                }

                Long rawMaterialId = component.getRawMaterial().getId();
                Integer stockAvailable = currentStock.getOrDefault(rawMaterialId, 0);

                int possibleWithThisIngredient = stockAvailable / requiredPerProduct;

                if (possibleWithThisIngredient < maxQuantityPossible) {
                    maxQuantityPossible = possibleWithThisIngredient;
                }
            }

            if (!hasInvalidComponent && maxQuantityPossible > 0 && maxQuantityPossible != Integer.MAX_VALUE) {
                BigDecimal totalValue = product.getValue().multiply(BigDecimal.valueOf(maxQuantityPossible));

                plan.add(new ProductionPlanDTO(
                        product.getName(),
                        maxQuantityPossible,
                        totalValue));

                for (ProductComponent component : product.getComponents()) {
                    Long rawMaterialId = component.getRawMaterial().getId();
                    Integer requiredPerProduct = component.getQuantityRequired();

                    int currentQty = currentStock.getOrDefault(rawMaterialId, 0);
                    int usedQty = maxQuantityPossible * requiredPerProduct;

                    currentStock.put(rawMaterialId, Math.max(0, currentQty - usedQty));
                }
            }
        }

        return plan;
    }

    @Transactional
    public ProductionOrderResponseDTO executeProductionPlan() {
        List<Product> products = productRepository.findAll();
        List<RawMaterial> rawMaterials = rawMaterialRepository.findAll();

        Map<Long, RawMaterial> rawMaterialEntityMap = rawMaterials.stream()
                .filter(rm -> rm != null && rm.getId() != null)
                .collect(Collectors.toMap(RawMaterial::getId, Function.identity()));

        Map<Long, Integer> currentStock = new HashMap<>();
        for (RawMaterial rm : rawMaterials) {
            if (rm != null && rm.getId() != null) {
                currentStock.put(rm.getId(), rm.getStockQuantity() != null ? rm.getStockQuantity() : 0);
            }
        }

        products.sort((p1, p2) -> {
            BigDecimal v1 = p1.getValue() != null ? p1.getValue() : BigDecimal.ZERO;
            BigDecimal v2 = p2.getValue() != null ? p2.getValue() : BigDecimal.ZERO;
            return v2.compareTo(v1);
        });

        List<ProductionOrderItem> orderItems = new ArrayList<>();
        BigDecimal totalOrderValue = BigDecimal.ZERO;
        int totalItemsCount = 0;

        for (Product product : products) {
            if (product.getComponents() == null || product.getComponents().isEmpty() || product.getValue() == null) {
                continue;
            }

            int maxQuantityPossible = Integer.MAX_VALUE;
            boolean hasInvalidComponent = false;

            for (ProductComponent component : product.getComponents()) {
                if (component.getRawMaterial() == null || component.getRawMaterial().getId() == null) {
                    hasInvalidComponent = true;
                    break;
                }

                Integer requiredPerProduct = component.getQuantityRequired();
                if (requiredPerProduct == null || requiredPerProduct <= 0) {
                    hasInvalidComponent = true;
                    break;
                }

                Long rawMaterialId = component.getRawMaterial().getId();
                Integer stockAvailable = currentStock.getOrDefault(rawMaterialId, 0);

                int possibleWithThisIngredient = stockAvailable / requiredPerProduct;
                if (possibleWithThisIngredient < maxQuantityPossible) {
                    maxQuantityPossible = possibleWithThisIngredient;
                }
            }

            if (!hasInvalidComponent && maxQuantityPossible > 0 && maxQuantityPossible != Integer.MAX_VALUE) {
                BigDecimal subtotal = product.getValue().multiply(BigDecimal.valueOf(maxQuantityPossible));
                totalOrderValue = totalOrderValue.add(subtotal);
                totalItemsCount += maxQuantityPossible;

                ProductionOrderItem item = ProductionOrderItem.builder()
                        .product(product)
                        .productName(product.getName())
                        .unitValue(product.getValue())
                        .quantity(maxQuantityPossible)
                        .subtotal(subtotal)
                        .build();

                orderItems.add(item);

                for (ProductComponent component : product.getComponents()) {
                    Long rawMaterialId = component.getRawMaterial().getId();
                    Integer requiredPerProduct = component.getQuantityRequired();

                    int currentQty = currentStock.getOrDefault(rawMaterialId, 0);
                    int usedQty = maxQuantityPossible * requiredPerProduct;
                    int newStock = Math.max(0, currentQty - usedQty);

                    currentStock.put(rawMaterialId, newStock);
                    RawMaterial rmEntity = rawMaterialEntityMap.get(rawMaterialId);
                    if (rmEntity != null) {
                        rmEntity.setStockQuantity(newStock);
                    }
                }
            }
        }

        if (orderItems.isEmpty()) {
            throw new BusinessRuleException("Não há estoque de matérias-primas suficiente para executar nenhuma produção.");
        }

        rawMaterialRepository.saveAll(rawMaterialEntityMap.values());

        ProductionOrder order = ProductionOrder.builder()
                .createdAt(LocalDateTime.now())
                .totalValue(totalOrderValue)
                .totalItems(totalItemsCount)
                .status("COMPLETED")
                .items(new ArrayList<>())
                .build();

        for (ProductionOrderItem item : orderItems) {
            order.addItem(item);
        }

        ProductionOrder savedOrder = productionOrderRepository.save(order);

        List<ProductionOrderItemResponseDTO> itemDTOs = savedOrder.getItems().stream()
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
                savedOrder.getId(),
                savedOrder.getCreatedAt(),
                savedOrder.getTotalValue(),
                savedOrder.getTotalItems(),
                savedOrder.getStatus(),
                itemDTOs
        );
    }
}