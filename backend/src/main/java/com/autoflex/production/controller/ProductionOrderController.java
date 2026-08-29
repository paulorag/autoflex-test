package com.autoflex.production.controller;

import com.autoflex.production.dto.response.ProductionOrderResponseDTO;
import com.autoflex.production.service.ProductionOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Ordens de Produção", description = "Endpoints para consulta e auditoria do histórico de ordens de produção executadas")
@RestController
@RequestMapping("/api/production-orders")
@RequiredArgsConstructor
public class ProductionOrderController {

    private final ProductionOrderService service;

    @Operation(summary = "Listar histórico de ordens", description = "Retorna a listagem cronológica de todas as ordens de fabricação já executadas com itens e valores.")
    @ApiResponse(responseCode = "200", description = "Histórico de ordens retornado com sucesso")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<ProductionOrderResponseDTO>> listAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @Operation(summary = "Buscar ordem por ID", description = "Retorna os detalhes completos de uma ordem de produção específica.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Ordem encontrada"),
            @ApiResponse(responseCode = "404", description = "Ordem não encontrada")
    })
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ProductionOrderResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }
}
