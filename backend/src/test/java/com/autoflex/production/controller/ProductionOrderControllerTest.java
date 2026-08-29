package com.autoflex.production.controller;

import com.autoflex.production.dto.response.ProductionOrderItemResponseDTO;
import com.autoflex.production.dto.response.ProductionOrderResponseDTO;
import com.autoflex.production.exception.GlobalExceptionHandler;
import com.autoflex.production.exception.ResourceNotFoundException;
import com.autoflex.production.security.JwtTokenService;
import com.autoflex.production.service.ProductionOrderService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductionOrderController.class)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
class ProductionOrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductionOrderService service;

    @MockitoBean
    private JwtTokenService jwtTokenService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @Test
    @DisplayName("GET /api/production-orders - Deve retornar lista de ordens com 200 OK")
    void shouldListAllOrders() throws Exception {
        ProductionOrderItemResponseDTO item = new ProductionOrderItemResponseDTO(1L, 1L, "Mesa", BigDecimal.valueOf(500.0), 2, BigDecimal.valueOf(1000.0));
        ProductionOrderResponseDTO order = new ProductionOrderResponseDTO(1L, LocalDateTime.now(), BigDecimal.valueOf(1000.0), 2, "COMPLETED", List.of(item));

        when(service.findAll()).thenReturn(List.of(order));

        mockMvc.perform(get("/api/production-orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].totalValue").value(1000.0))
                .andExpect(jsonPath("$[0].items[0].productName").value("Mesa"));
    }

    @Test
    @DisplayName("GET /api/production-orders/{id} - Deve retornar 404 quando não encontrada")
    void shouldReturn404WhenNotFound() throws Exception {
        when(service.findById(99L)).thenThrow(new ResourceNotFoundException("Ordem não encontrada"));

        mockMvc.perform(get("/api/production-orders/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
