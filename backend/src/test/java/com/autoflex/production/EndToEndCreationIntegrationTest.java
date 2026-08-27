package com.autoflex.production;

import com.autoflex.production.dto.request.ProductComponentRequestDTO;
import com.autoflex.production.dto.request.ProductRequestDTO;
import com.autoflex.production.dto.request.RawMaterialRequestDTO;
import com.autoflex.production.dto.response.ProductResponseDTO;
import com.autoflex.production.dto.response.RawMaterialResponseDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class EndToEndCreationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Deve cadastrar nova matéria-prima no banco de dados real sem conflito de chave primária")
    void shouldCreateRawMaterialSuccessfullyInRealDatabase() throws Exception {
        RawMaterialRequestDTO request = new RawMaterialRequestDTO("Alumínio Anodizado", 50);

        mockMvc.perform(post("/api/raw-materials")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Alumínio Anodizado"))
                .andExpect(jsonPath("$.stockQuantity").value(50));
    }

    @Test
    @DisplayName("Deve cadastrar novo produto com receita no banco de dados real sem conflito de chave primária")
    void shouldCreateProductWithComponentsSuccessfullyInRealDatabase() throws Exception {
        // Primeiro cria uma matéria-prima para usar na receita
        RawMaterialRequestDTO rmRequest = new RawMaterialRequestDTO("Tecido Couro Sintético", 30);
        String rmResponseJson = mockMvc.perform(post("/api/raw-materials")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rmRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        RawMaterialResponseDTO rmResponse = objectMapper.readValue(rmResponseJson, RawMaterialResponseDTO.class);

        // Agora cria o produto usando a matéria-prima
        ProductComponentRequestDTO comp = new ProductComponentRequestDTO(rmResponse.id(), 3);
        ProductRequestDTO prodRequest = new ProductRequestDTO(
                "Poltrona Presidente Couro",
                BigDecimal.valueOf(890.00),
                List.of(comp)
        );

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(prodRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Poltrona Presidente Couro"))
                .andExpect(jsonPath("$.value").value(890.00))
                .andExpect(jsonPath("$.components[0].rawMaterial.name").value("Tecido Couro Sintético"))
                .andExpect(jsonPath("$.components[0].quantityRequired").value(3));
    }
}
