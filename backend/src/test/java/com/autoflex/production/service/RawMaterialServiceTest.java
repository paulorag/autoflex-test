package com.autoflex.production.service;

import com.autoflex.production.domain.RawMaterial;
import com.autoflex.production.dto.request.RawMaterialRequestDTO;
import com.autoflex.production.dto.response.RawMaterialResponseDTO;
import com.autoflex.production.exception.BusinessRuleException;
import com.autoflex.production.exception.ResourceNotFoundException;
import com.autoflex.production.mapper.RawMaterialMapper;
import com.autoflex.production.repository.ProductComponentRepository;
import com.autoflex.production.repository.RawMaterialRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RawMaterialServiceTest {

    @Mock
    private RawMaterialRepository rawMaterialRepository;

    @Mock
    private ProductComponentRepository productComponentRepository;

    @Spy
    private RawMaterialMapper mapper = new RawMaterialMapper();

    @InjectMocks
    private RawMaterialService rawMaterialService;

    private RawMaterial sampleMaterial;

    @BeforeEach
    void setUp() {
        sampleMaterial = RawMaterial.builder()
                .id(1L)
                .name("Aço Inox")
                .stockQuantity(100)
                .build();
    }

    @Test
    @DisplayName("Deve listar todas as matérias-primas convertidas em DTO")
    void shouldListAllRawMaterials() {
        when(rawMaterialRepository.findAll()).thenReturn(List.of(sampleMaterial));

        List<RawMaterialResponseDTO> result = rawMaterialService.findAll();

        assertEquals(1, result.size());
        assertEquals("Aço Inox", result.get(0).name());
        assertEquals(100, result.get(0).stockQuantity());
    }

    @Test
    @DisplayName("Deve buscar matéria-prima por ID com sucesso")
    void shouldFindByIdSuccessfully() {
        when(rawMaterialRepository.findById(1L)).thenReturn(Optional.of(sampleMaterial));

        RawMaterialResponseDTO result = rawMaterialService.findById(1L);

        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals("Aço Inox", result.name());
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException quando ID não existir")
    void shouldThrowExceptionWhenNotFound() {
        when(rawMaterialRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> rawMaterialService.findById(99L));
    }

    @Test
    @DisplayName("Deve criar nova matéria-prima com sucesso")
    void shouldCreateRawMaterial() {
        RawMaterialRequestDTO request = new RawMaterialRequestDTO("Madeira Maciça", 50);
        RawMaterial saved = RawMaterial.builder().id(2L).name("Madeira Maciça").stockQuantity(50).build();

        when(rawMaterialRepository.save(any(RawMaterial.class))).thenReturn(saved);

        RawMaterialResponseDTO result = rawMaterialService.create(request);

        assertNotNull(result);
        assertEquals(2L, result.id());
        assertEquals("Madeira Maciça", result.name());
        assertEquals(50, result.stockQuantity());
    }

    @Test
    @DisplayName("Deve atualizar matéria-prima existente com sucesso")
    void shouldUpdateRawMaterial() {
        RawMaterialRequestDTO updateRequest = new RawMaterialRequestDTO("Aço Inox 316", 150);

        when(rawMaterialRepository.findById(1L)).thenReturn(Optional.of(sampleMaterial));
        when(rawMaterialRepository.save(any(RawMaterial.class))).thenReturn(sampleMaterial);

        RawMaterialResponseDTO result = rawMaterialService.update(1L, updateRequest);

        assertNotNull(result);
        assertEquals("Aço Inox 316", result.name());
        assertEquals(150, result.stockQuantity());
    }

    @Test
    @DisplayName("Deve deletar matéria-prima não vinculada a produtos")
    void shouldDeleteRawMaterialWhenNotInUse() {
        when(rawMaterialRepository.existsById(1L)).thenReturn(true);
        when(productComponentRepository.existsByRawMaterialId(1L)).thenReturn(false);

        assertDoesNotThrow(() -> rawMaterialService.delete(1L));
        verify(rawMaterialRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Deve impedir exclusão de matéria-prima vinculada a receitas")
    void shouldPreventDeletionWhenMaterialInUse() {
        when(rawMaterialRepository.existsById(1L)).thenReturn(true);
        when(productComponentRepository.existsByRawMaterialId(1L)).thenReturn(true);

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () -> rawMaterialService.delete(1L));
        assertTrue(ex.getMessage().contains("vinculada a receitas"));
        verify(rawMaterialRepository, never()).deleteById(1L);
    }
}
