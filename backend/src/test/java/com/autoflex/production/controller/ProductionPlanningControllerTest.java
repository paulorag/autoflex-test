package com.autoflex.production.controller;

import com.autoflex.production.dto.ProductionPlanDTO;
import com.autoflex.production.dto.response.ProductionOrderItemResponseDTO;
import com.autoflex.production.dto.response.ProductionOrderResponseDTO;
import com.autoflex.production.exception.BusinessRuleException;
import com.autoflex.production.exception.GlobalExceptionHandler;
import com.autoflex.production.service.ProductionPlanningService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductionPlanningController.class)
@Import(GlobalExceptionHandler.class)
class ProductionPlanningControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductionPlanningService service;

    @Test
    @DisplayName("GET /api/production-planning - Deve retornar plano calculado com 200 OK")
    void shouldGetProductionPlan() throws Exception {
        ProductionPlanDTO planDto = new ProductionPlanDTO("Mesa", 10, BigDecimal.valueOf(5000.0));
        when(service.calculateProductionPlan()).thenReturn(List.of(planDto));

        mockMvc.perform(get("/api/production-planning"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].productName").value("Mesa"))
                .andExpect(jsonPath("$[0].quantity").value(10))
                .andExpect(jsonPath("$[0].totalValue").value(5000.0));
    }

    @Test
    @DisplayName("POST /api/production-planning/execute - Deve executar produção e retornar 201 Created")
    void shouldExecuteProductionPlan() throws Exception {
        ProductionOrderItemResponseDTO item = new ProductionOrderItemResponseDTO(1L, 1L, "Mesa", BigDecimal.valueOf(500.0), 2, BigDecimal.valueOf(1000.0));
        ProductionOrderResponseDTO order = new ProductionOrderResponseDTO(10L, LocalDateTime.now(), BigDecimal.valueOf(1000.0), 2, "COMPLETED", List.of(item));

        when(service.executeProductionPlan()).thenReturn(order);

        mockMvc.perform(post("/api/production-planning/execute"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.totalValue").value(1000.0))
                .andExpect(jsonPath("$.items[0].productName").value("Mesa"));
    }

    @Test
    @DisplayName("POST /api/production-planning/execute - Deve retornar 400 quando estoque for insuficiente")
    void shouldReturn400WhenNoStock() throws Exception {
        when(service.executeProductionPlan()).thenThrow(new BusinessRuleException("Estoque insuficiente para produzir"));

        mockMvc.perform(post("/api/production-planning/execute"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Estoque insuficiente para produzir"));
    }
}
