package com.autoflex.production.controller;

import com.autoflex.production.dto.request.ProductComponentRequestDTO;
import com.autoflex.production.dto.request.ProductRequestDTO;
import com.autoflex.production.dto.response.ProductComponentResponseDTO;
import com.autoflex.production.dto.response.ProductResponseDTO;
import com.autoflex.production.dto.response.RawMaterialResponseDTO;
import com.autoflex.production.exception.GlobalExceptionHandler;
import com.autoflex.production.exception.ResourceNotFoundException;
import com.autoflex.production.security.JwtTokenService;
import com.autoflex.production.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProductService service;

    @MockitoBean
    private JwtTokenService jwtTokenService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @Test
    @DisplayName("GET /api/products - Deve retornar lista de produtos com 200 OK")
    void shouldListAllProducts() throws Exception {
        RawMaterialResponseDTO rmDto = new RawMaterialResponseDTO(1L, "Madeira", 100);
        ProductComponentResponseDTO compDto = new ProductComponentResponseDTO(10L, rmDto, 4);
        ProductResponseDTO productDto = new ProductResponseDTO(1L, "Mesa", BigDecimal.valueOf(350.0), List.of(compDto));

        when(service.findAll()).thenReturn(List.of(productDto));

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Mesa"))
                .andExpect(jsonPath("$[0].value").value(350.0))
                .andExpect(jsonPath("$[0].components[0].rawMaterial.name").value("Madeira"));
    }

    @Test
    @DisplayName("POST /api/products - Deve criar produto com 201 Created")
    void shouldCreateProduct() throws Exception {
        ProductComponentRequestDTO compRequest = new ProductComponentRequestDTO(1L, 4);
        ProductRequestDTO request = new ProductRequestDTO("Mesa", BigDecimal.valueOf(350.0), List.of(compRequest));

        RawMaterialResponseDTO rmDto = new RawMaterialResponseDTO(1L, "Madeira", 100);
        ProductComponentResponseDTO compDto = new ProductComponentResponseDTO(10L, rmDto, 4);
        ProductResponseDTO response = new ProductResponseDTO(1L, "Mesa", BigDecimal.valueOf(350.0), List.of(compDto));

        when(service.create(any(ProductRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Mesa"));
    }

    @Test
    @DisplayName("POST /api/products - Deve retornar 400 quando receita for vazia ou valor for zero")
    void shouldReturn400WhenInvalid() throws Exception {
        ProductRequestDTO invalidRequest = new ProductRequestDTO("", BigDecimal.valueOf(-10.0), Collections.emptyList());

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").exists())
                .andExpect(jsonPath("$.fieldErrors.value").exists())
                .andExpect(jsonPath("$.fieldErrors.components").exists());
    }

    @Test
    @DisplayName("GET /api/products/{id} - Deve retornar 404 quando não existir")
    void shouldReturn404() throws Exception {
        when(service.findById(999L)).thenThrow(new ResourceNotFoundException("Produto não encontrado"));

        mockMvc.perform(get("/api/products/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
