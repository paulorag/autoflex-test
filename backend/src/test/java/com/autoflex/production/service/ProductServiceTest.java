package com.autoflex.production.service;

import com.autoflex.production.domain.Product;
import com.autoflex.production.domain.ProductComponent;
import com.autoflex.production.domain.RawMaterial;
import com.autoflex.production.dto.request.ProductComponentRequestDTO;
import com.autoflex.production.dto.request.ProductRequestDTO;
import com.autoflex.production.dto.response.ProductResponseDTO;
import com.autoflex.production.exception.BusinessRuleException;
import com.autoflex.production.exception.ResourceNotFoundException;
import com.autoflex.production.mapper.ProductMapper;
import com.autoflex.production.mapper.RawMaterialMapper;
import com.autoflex.production.repository.ProductRepository;
import com.autoflex.production.repository.RawMaterialRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private RawMaterialRepository rawMaterialRepository;

    @Spy
    private RawMaterialMapper rawMaterialMapper = new RawMaterialMapper();

    @Spy
    private ProductMapper productMapper = new ProductMapper(new RawMaterialMapper());

    @InjectMocks
    private ProductService productService;

    private RawMaterial madeira;
    private Product mesa;

    @BeforeEach
    void setUp() {
        madeira = RawMaterial.builder().id(1L).name("Madeira").stockQuantity(50).build();

        mesa = Product.builder()
                .id(1L)
                .name("Mesa de Jantar")
                .value(BigDecimal.valueOf(450.0))
                .components(new ArrayList<>())
                .build();

        ProductComponent comp = ProductComponent.builder()
                .id(10L)
                .product(mesa)
                .rawMaterial(madeira)
                .quantityRequired(4)
                .build();
        mesa.addComponent(comp);
    }

    @Test
    @DisplayName("Deve listar todos os produtos com componentes mapeados")
    void shouldListAllProducts() {
        when(productRepository.findAll()).thenReturn(List.of(mesa));

        List<ProductResponseDTO> result = productService.findAll();

        assertEquals(1, result.size());
        assertEquals("Mesa de Jantar", result.get(0).name());
        assertEquals(BigDecimal.valueOf(450.0), result.get(0).value());
        assertEquals(1, result.get(0).components().size());
        assertEquals("Madeira", result.get(0).components().get(0).rawMaterial().name());
    }

    @Test
    @DisplayName("Deve buscar produto por ID com sucesso")
    void shouldFindById() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(mesa));

        ProductResponseDTO result = productService.findById(1L);

        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals("Mesa de Jantar", result.name());
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException para ID inexistente")
    void shouldThrowWhenNotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.findById(99L));
    }

    @Test
    @DisplayName("Deve criar produto com receita válida")
    void shouldCreateProduct() {
        ProductComponentRequestDTO compDto = new ProductComponentRequestDTO(1L, 4);
        ProductRequestDTO request = new ProductRequestDTO("Mesa Nova", BigDecimal.valueOf(500.0), List.of(compDto));

        when(rawMaterialRepository.findAllById(any())).thenReturn(List.of(madeira));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setId(2L);
            return p;
        });

        ProductResponseDTO result = productService.create(request);

        assertNotNull(result);
        assertEquals(2L, result.id());
        assertEquals("Mesa Nova", result.name());
        assertEquals(1, result.components().size());
    }

    @Test
    @DisplayName("Deve lançar erro ao tentar criar produto sem componentes")
    void shouldThrowWhenCreatingWithoutComponents() {
        ProductRequestDTO request = new ProductRequestDTO("Vazio", BigDecimal.valueOf(100.0), Collections.emptyList());

        assertThrows(BusinessRuleException.class, () -> productService.create(request));
    }

    @Test
    @DisplayName("Deve lançar erro ao tentar criar produto com matéria-prima inexistente")
    void shouldThrowWhenRawMaterialNotFound() {
        ProductComponentRequestDTO compDto = new ProductComponentRequestDTO(999L, 2);
        ProductRequestDTO request = new ProductRequestDTO("Invalido", BigDecimal.valueOf(100.0), List.of(compDto));

        when(rawMaterialRepository.findAllById(any())).thenReturn(Collections.emptyList());

        assertThrows(ResourceNotFoundException.class, () -> productService.create(request));
    }

    @Test
    @DisplayName("Deve deletar produto com sucesso")
    void shouldDeleteProduct() {
        when(productRepository.existsById(1L)).thenReturn(true);

        assertDoesNotThrow(() -> productService.delete(1L));
        verify(productRepository, times(1)).deleteById(1L);
    }
}
