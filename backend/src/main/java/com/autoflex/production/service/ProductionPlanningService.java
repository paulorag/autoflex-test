package com.autoflex.production.service;

import com.autoflex.production.domain.Product;
import com.autoflex.production.domain.ProductComponent;
import com.autoflex.production.domain.RawMaterial;
import com.autoflex.production.dto.ProductionPlanDTO;
import com.autoflex.production.repository.ProductRepository;
import com.autoflex.production.repository.RawMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductionPlanningService {

    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;

    public List<ProductionPlanDTO> calculateProductionPlan() {
        List<Product> products = productRepository.findAll();
        List<RawMaterial> rawMaterials = rawMaterialRepository.findAll();

        Map<Long, Integer> currentStock = new HashMap<>();
        for (RawMaterial rm : rawMaterials) {
            currentStock.put(rm.getId(), rm.getStockQuantity());
        }

        products.sort(Comparator.comparing(Product::getValue).reversed());

        List<ProductionPlanDTO> plan = new ArrayList<>();

        for (Product product : products) {

            if (product.getComponents() == null || product.getComponents().isEmpty()) {
                continue;
            }

            int maxQuantityPossible = Integer.MAX_VALUE;

            for (ProductComponent component : product.getComponents()) {
                Long rawMaterialId = component.getRawMaterial().getId();
                Integer requiredPerProduct = component.getQuantityRequired();

                Integer stockAvailable = currentStock.getOrDefault(rawMaterialId, 0);

                int possibleWithThisIngredient = stockAvailable / requiredPerProduct;

                if (possibleWithThisIngredient < maxQuantityPossible) {
                    maxQuantityPossible = possibleWithThisIngredient;
                }
            }

            if (maxQuantityPossible > 0 && maxQuantityPossible != Integer.MAX_VALUE) {

                BigDecimal totalValue = product.getValue().multiply(new BigDecimal(maxQuantityPossible));

                plan.add(new ProductionPlanDTO(
                        product.getName(),
                        maxQuantityPossible,
                        totalValue));

                for (ProductComponent component : product.getComponents()) {
                    Long rawMaterialId = component.getRawMaterial().getId();
                    Integer requiredPerProduct = component.getQuantityRequired();

                    Integer currentQty = currentStock.get(rawMaterialId);
                    Integer usedQty = maxQuantityPossible * requiredPerProduct;

                    currentStock.put(rawMaterialId, currentQty - usedQty);
                }
            }
        }

        return plan;
    }
}