package com.autoflex.production.controller;

import com.autoflex.production.dto.request.RawMaterialRequestDTO;
import com.autoflex.production.dto.response.RawMaterialResponseDTO;
import com.autoflex.production.service.RawMaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/raw-materials")
@RequiredArgsConstructor
public class RawMaterialController {

    private final RawMaterialService service;

    @GetMapping
    public ResponseEntity<List<RawMaterialResponseDTO>> listAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RawMaterialResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<RawMaterialResponseDTO> create(@Valid @RequestBody RawMaterialRequestDTO requestDTO) {
        RawMaterialResponseDTO created = service.create(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RawMaterialResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody RawMaterialRequestDTO requestDTO) {
        return ResponseEntity.ok(service.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}