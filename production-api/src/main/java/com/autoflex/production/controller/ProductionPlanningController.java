package com.autoflex.production.controller;

import com.autoflex.production.dto.ProductionPlanDTO;
import com.autoflex.production.service.ProductionPlanningService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production-planning")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProductionPlanningController {

    private final ProductionPlanningService service;

    @GetMapping
    public List<ProductionPlanDTO> getProductionPlan() {
        return service.calculateProductionPlan();
    }
}