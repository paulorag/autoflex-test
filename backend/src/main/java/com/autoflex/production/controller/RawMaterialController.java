package com.autoflex.production.controller;

import com.autoflex.production.domain.RawMaterial;
import com.autoflex.production.service.RawMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/raw-materials")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class RawMaterialController {

    private final RawMaterialService service;

    @GetMapping
    public List<RawMaterial> listAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RawMaterial> findById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RawMaterial create(@RequestBody RawMaterial rawMaterial) {
        return service.save(rawMaterial);
    }

    @PutMapping("/{id}")
    public RawMaterial update(@PathVariable Long id, @RequestBody RawMaterial rawMaterial) {
        rawMaterial.setId(id);
        return service.save(rawMaterial);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}