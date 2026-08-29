package com.autoflex.production.controller;

import com.autoflex.production.dto.ProductionPlanDTO;
import com.autoflex.production.dto.response.ProductionOrderResponseDTO;
import com.autoflex.production.service.ProductionPlanningService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Planejamento PCP", description = "Endpoints para cálculo de capacidade de produção otimizada e efetivação no chão de fábrica")
@RestController
@RequestMapping("/api/production-planning")
@RequiredArgsConstructor
public class ProductionPlanningController {

    private final ProductionPlanningService service;

    @Operation(summary = "Calcular plano ótimo de produção", description = "Executa o algoritmo guloso de otimização de faturamento com base no saldo atual de matérias-primas.")
    @ApiResponse(responseCode = "200", description = "Plano de produção calculado com sucesso")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<ProductionPlanDTO>> getProductionPlan() {
        return ResponseEntity.ok(service.calculateProductionPlan());
    }

    @Operation(summary = "Efetivar ordem de produção", description = "Efetiva a fabricação do plano ótimo, debita atomicamente as matérias-primas do estoque e gera o registro histórico da ordem.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Ordem de produção executada e estoque debitado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Estoque insuficiente para produzir qualquer item"),
            @ApiResponse(responseCode = "401", description = "Não autenticado")
    })
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    @PostMapping("/execute")
    public ResponseEntity<ProductionOrderResponseDTO> executeProductionPlan() {
        ProductionOrderResponseDTO executedOrder = service.executeProductionPlan();
        return ResponseEntity.status(HttpStatus.CREATED).body(executedOrder);
    }
}