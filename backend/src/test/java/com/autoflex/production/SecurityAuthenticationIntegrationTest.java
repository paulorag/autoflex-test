package com.autoflex.production;

import com.autoflex.production.domain.Role;
import com.autoflex.production.dto.request.LoginRequestDTO;
import com.autoflex.production.dto.request.RegisterRequestDTO;
import com.autoflex.production.dto.response.AuthResponseDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityAuthenticationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/auth/login - Deve autenticar com sucesso e retornar token JWT")
    void shouldLoginSuccessfully() throws Exception {
        LoginRequestDTO loginRequest = new LoginRequestDTO("admin", "admin123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("POST /api/auth/login - Deve retornar 401 Unauthorized para credenciais inválidas")
    void shouldFailLoginWithInvalidCredentials() throws Exception {
        LoginRequestDTO loginRequest = new LoginRequestDTO("admin", "senha_errada");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Credenciais Inválidas"));
    }

    @Test
    @DisplayName("POST /api/auth/register - Deve registrar novo operador com sucesso")
    void shouldRegisterNewUser() throws Exception {
        RegisterRequestDTO registerRequest = new RegisterRequestDTO(
                "novo_operador",
                "senha123",
                "Novo Operador Teste",
                Role.ROLE_OPERATOR
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.username").value("novo_operador"))
                .andExpect(jsonPath("$.role").value("ROLE_OPERATOR"));
    }

    @Test
    @DisplayName("GET /api/raw-materials - Deve retornar 401 Unauthorized para requisição sem token JWT")
    void shouldReturn401WhenRequestWithoutToken() throws Exception {
        mockMvc.perform(get("/api/raw-materials"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Não Autorizado"));
    }

    @Test
    @DisplayName("RBAC - Operador autenticado pode listar matérias-primas mas recebe 403 Forbidden ao tentar deletar")
    void operatorCanListButCannotDelete() throws Exception {
        // 1. Faz login como operador para obter o token JWT
        LoginRequestDTO loginRequest = new LoginRequestDTO("operador", "operador123");
        String authJson = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        AuthResponseDTO authResponse = objectMapper.readValue(authJson, AuthResponseDTO.class);
        String token = authResponse.token();

        // 2. Operador faz GET com sucesso (200 OK)
        mockMvc.perform(get("/api/raw-materials")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // 3. Operador tenta DELETE e recebe 403 Forbidden (RBAC funcionando!)
        mockMvc.perform(delete("/api/raw-materials/1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Acesso Proibido"));
    }

    @Test
    @DisplayName("GET /api/auth/me - Deve retornar perfil do usuário logado via JWT")
    void shouldGetCurrentUserProfile() throws Exception {
        LoginRequestDTO loginRequest = new LoginRequestDTO("admin", "admin123");
        String authJson = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        AuthResponseDTO authResponse = objectMapper.readValue(authJson, AuthResponseDTO.class);

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + authResponse.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("ROLE_ADMIN"));
    }
}
