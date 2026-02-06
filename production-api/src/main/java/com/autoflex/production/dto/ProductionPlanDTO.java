package com.autoflex.production.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class ProductionPlanDTO {
    private String productName;
    private Integer quantity;
    private BigDecimal totalValue;
}