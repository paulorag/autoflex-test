package com.autoflex.production.service;

import com.autoflex.production.domain.RawMaterial;
import com.autoflex.production.repository.RawMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RawMaterialService {

    private final RawMaterialRepository repository;

    public List<RawMaterial> findAll() {
        return repository.findAll();
    }

    public Optional<RawMaterial> findById(Long id) {
        return repository.findById(id);
    }

    public RawMaterial save(RawMaterial rawMaterial) {
        return repository.save(rawMaterial);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}