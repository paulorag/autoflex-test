package com.autoflex.production.service;

import com.autoflex.production.domain.RawMaterial;
import com.autoflex.production.dto.request.RawMaterialRequestDTO;
import com.autoflex.production.dto.response.RawMaterialResponseDTO;
import com.autoflex.production.exception.BusinessRuleException;
import com.autoflex.production.exception.ResourceNotFoundException;
import com.autoflex.production.mapper.RawMaterialMapper;
import com.autoflex.production.repository.ProductComponentRepository;
import com.autoflex.production.repository.RawMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RawMaterialService {

    private final RawMaterialRepository rawMaterialRepository;
    private final ProductComponentRepository productComponentRepository;
    private final RawMaterialMapper mapper;

    @Transactional(readOnly = true)
    public List<RawMaterialResponseDTO> findAll() {
        return rawMaterialRepository.findAll().stream()
                .map(mapper::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public RawMaterialResponseDTO findById(Long id) {
        return rawMaterialRepository.findById(id)
                .map(mapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Matéria-prima não encontrada com o ID: " + id));
    }

    @Transactional(readOnly = true)
    public RawMaterial findEntityById(Long id) {
        return rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matéria-prima não encontrada com o ID: " + id));
    }

    @Transactional
    public RawMaterialResponseDTO create(RawMaterialRequestDTO requestDTO) {
        RawMaterial entity = mapper.toEntity(requestDTO);
        RawMaterial saved = rawMaterialRepository.save(entity);
        return mapper.toResponseDTO(saved);
    }

    @Transactional
    public RawMaterialResponseDTO update(Long id, RawMaterialRequestDTO requestDTO) {
        RawMaterial entity = findEntityById(id);
        mapper.updateEntityFromDto(entity, requestDTO);
        RawMaterial saved = rawMaterialRepository.save(entity);
        return mapper.toResponseDTO(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!rawMaterialRepository.existsById(id)) {
            throw new ResourceNotFoundException("Matéria-prima não encontrada com o ID: " + id);
        }

        if (productComponentRepository.existsByRawMaterialId(id)) {
            throw new BusinessRuleException("Não é possível excluir esta matéria-prima pois ela está vinculada a receitas de produtos cadastrados.");
        }

        rawMaterialRepository.deleteById(id);
    }
}