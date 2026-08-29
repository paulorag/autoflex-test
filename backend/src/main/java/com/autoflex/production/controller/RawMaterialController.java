package com.autoflex.production.controller;

import com.autoflex.production.dto.request.RawMaterialRequestDTO;
import com.autoflex.production.dto.response.RawMaterialResponseDTO;
import com.autoflex.production.service.RawMaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Matérias-Primas", description = "Endpoints para gerenciamento do estoque de insumos e matérias-primas")
@RestController
@RequestMapping("/api/raw-materials")
@RequiredArgsConstructor
public class RawMaterialController {

    private final RawMaterialService service;

    @Operation(summary = "Listar todas as matérias-primas", description = "Retorna a listagem completa dos insumos e respectivos saldos em estoque.")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<RawMaterialResponseDTO>> listAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @Operation(summary = "Buscar matéria-prima por ID", description = "Retorna os detalhes de uma matéria-prima específica.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Matéria-prima encontrada"),
            @ApiResponse(responseCode = "404", description = "Matéria-prima não encontrada")
    })
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<RawMaterialResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @Operation(summary = "Cadastrar nova matéria-prima", description = "Cadastra um novo insumo no estoque (Requer perfil ADMIN).")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Matéria-prima criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos"),
            @ApiResponse(responseCode = "403", description = "Acesso proibido: Requer perfil ADMIN")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<RawMaterialResponseDTO> create(@Valid @RequestBody RawMaterialRequestDTO requestDTO) {
        RawMaterialResponseDTO created = service.create(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Atualizar matéria-prima", description = "Atualiza os dados de um insumo existente (Requer perfil ADMIN).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Matéria-prima atualizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos"),
            @ApiResponse(responseCode = "403", description = "Acesso proibido: Requer perfil ADMIN"),
            @ApiResponse(responseCode = "404", description = "Matéria-prima não encontrada")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<RawMaterialResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody RawMaterialRequestDTO requestDTO) {
        return ResponseEntity.ok(service.update(id, requestDTO));
    }

    @Operation(summary = "Excluir matéria-prima", description = "Remove um insumo do estoque, desde que não esteja em uso em nenhuma ficha técnica de produto (Requer perfil ADMIN).")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Matéria-prima excluída com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso proibido: Requer perfil ADMIN"),
            @ApiResponse(responseCode = "404", description = "Matéria-prima não encontrada"),
            @ApiResponse(responseCode = "409", description = "Conflito: Matéria-prima vinculada a receitas de produtos ativos")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}