package com.autoflex.production.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionPlanDTO {
    private String productName;
    private Integer quantity;
    private BigDecimal totalValue;
}