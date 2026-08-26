package com.autoflex.production.controller;

import com.autoflex.production.dto.ProductionPlanDTO;
import com.autoflex.production.dto.response.ProductionOrderResponseDTO;
import com.autoflex.production.service.ProductionPlanningService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/production-planning")
@RequiredArgsConstructor
public class ProductionPlanningController {

    private final ProductionPlanningService service;

    @GetMapping
    public ResponseEntity<List<ProductionPlanDTO>> getProductionPlan() {
        return ResponseEntity.ok(service.calculateProductionPlan());
    }

    @PostMapping("/execute")
    public ResponseEntity<ProductionOrderResponseDTO> executeProductionPlan() {
        ProductionOrderResponseDTO executedOrder = service.executeProductionPlan();
        return ResponseEntity.status(HttpStatus.CREATED).body(executedOrder);
    }
}