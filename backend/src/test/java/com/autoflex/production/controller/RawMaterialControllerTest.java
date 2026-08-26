package com.autoflex.production.controller;

import com.autoflex.production.dto.request.RawMaterialRequestDTO;
import com.autoflex.production.dto.response.RawMaterialResponseDTO;
import com.autoflex.production.exception.BusinessRuleException;
import com.autoflex.production.exception.GlobalExceptionHandler;
import com.autoflex.production.exception.ResourceNotFoundException;
import com.autoflex.production.service.RawMaterialService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RawMaterialController.class)
@Import(GlobalExceptionHandler.class)
class RawMaterialControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private RawMaterialService service;

    @Test
    @DisplayName("GET /api/raw-materials - Deve retornar lista com status 200")
    void shouldListAll() throws Exception {
        RawMaterialResponseDTO dto = new RawMaterialResponseDTO(1L, "Aço", 100);
        when(service.findAll()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/raw-materials"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].name").value("Aço"))
                .andExpect(jsonPath("$[0].stockQuantity").value(100));
    }

    @Test
    @DisplayName("GET /api/raw-materials/{id} - Deve retornar 404 quando não encontrado")
    void shouldReturn404WhenNotFound() throws Exception {
        when(service.findById(999L)).thenThrow(new ResourceNotFoundException("Matéria-prima não encontrada"));

        mockMvc.perform(get("/api/raw-materials/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Matéria-prima não encontrada"));
    }

    @Test
    @DisplayName("POST /api/raw-materials - Deve criar com status 201 quando dados válidos")
    void shouldCreateWhenValid() throws Exception {
        RawMaterialRequestDTO request = new RawMaterialRequestDTO("Madeira", 80);
        RawMaterialResponseDTO response = new RawMaterialResponseDTO(1L, "Madeira", 80);

        when(service.create(any(RawMaterialRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/raw-materials")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Madeira"))
                .andExpect(jsonPath("$.stockQuantity").value(80));
    }

    @Test
    @DisplayName("POST /api/raw-materials - Deve retornar 400 quando nome em branco ou estoque negativo")
    void shouldReturn400WhenInvalid() throws Exception {
        RawMaterialRequestDTO invalidRequest = new RawMaterialRequestDTO("", -5);

        mockMvc.perform(post("/api/raw-materials")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").exists())
                .andExpect(jsonPath("$.fieldErrors.stockQuantity").exists());
    }

    @Test
    @DisplayName("DELETE /api/raw-materials/{id} - Deve retornar 400/409 quando vinculada a produto")
    void shouldReturnBadRequestWhenInUse() throws Exception {
        doThrow(new BusinessRuleException("Não é possível excluir matéria-prima em uso"))
                .when(service).delete(1L);

        mockMvc.perform(delete("/api/raw-materials/1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Não é possível excluir matéria-prima em uso"));
    }
}
