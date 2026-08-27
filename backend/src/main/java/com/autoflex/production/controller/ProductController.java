package com.autoflex.production.controller;

import com.autoflex.production.dto.request.ProductRequestDTO;
import com.autoflex.production.dto.response.ProductResponseDTO;
import com.autoflex.production.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Produtos e Receitas", description = "Endpoints para gerenciamento do catálogo de produtos acabados e fichas técnicas (BOM)")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService service;

    @Operation(summary = "Listar todos os produtos", description = "Retorna todos os produtos acabados cadastrados com suas respectivas fichas técnicas de matérias-primas.")
    @ApiResponse(responseCode = "200", description = "Lista de produtos retornada com sucesso")
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> listAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @Operation(summary = "Buscar produto por ID", description = "Retorna os detalhes de um produto e sua receita completa.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Produto encontrado"),
            @ApiResponse(responseCode = "404", description = "Produto não encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @Operation(summary = "Cadastrar novo produto", description = "Cadastra um produto e define sua ficha técnica de insumos necessários.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Produto criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos ou sem insumos na receita")
    })
    @PostMapping
    public ResponseEntity<ProductResponseDTO> create(@Valid @RequestBody ProductRequestDTO requestDTO) {
        ProductResponseDTO created = service.create(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Atualizar produto", description = "Atualiza nome, valor de venda e receita do produto.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Produto atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos"),
            @ApiResponse(responseCode = "404", description = "Produto não encontrado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDTO requestDTO) {
        return ResponseEntity.ok(service.update(id, requestDTO));
    }

    @Operation(summary = "Excluir produto", description = "Remove um produto do catálogo.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Produto excluído com sucesso"),
            @ApiResponse(responseCode = "404", description = "Produto não encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}