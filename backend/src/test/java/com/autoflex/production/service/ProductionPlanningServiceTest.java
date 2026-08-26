package com.autoflex.production.service;

import com.autoflex.production.domain.Product;
import com.autoflex.production.domain.ProductComponent;
import com.autoflex.production.domain.ProductionOrder;
import com.autoflex.production.domain.RawMaterial;
import com.autoflex.production.dto.response.ProductionOrderResponseDTO;
import com.autoflex.production.exception.BusinessRuleException;
import com.autoflex.production.repository.ProductRepository;
import com.autoflex.production.repository.ProductionOrderRepository;
import com.autoflex.production.repository.RawMaterialRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductionPlanningServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private RawMaterialRepository rawMaterialRepository;

    @Mock
    private ProductionOrderRepository productionOrderRepository;

    @InjectMocks
    private ProductionPlanningService service;

    @Test
    @DisplayName("Deve priorizar produtos de maior valor no cálculo de planejamento")
    void shouldPrioritizeExpensiveProducts() {
        RawMaterial madeira = new RawMaterial();
        madeira.setId(1L);
        madeira.setName("Madeira");
        madeira.setStockQuantity(100);

        Product mesa = new Product();
        mesa.setName("Mesa");
        mesa.setValue(BigDecimal.valueOf(500.0));

        ProductComponent compMesa = new ProductComponent();
        compMesa.setRawMaterial(madeira);
        compMesa.setQuantityRequired(4);
        mesa.setComponents(List.of(compMesa));

        Product cadeira = new Product();
        cadeira.setName("Cadeira");
        cadeira.setValue(BigDecimal.valueOf(100.0));

        ProductComponent compCadeira = new ProductComponent();
        compCadeira.setRawMaterial(madeira);
        compCadeira.setQuantityRequired(2);
        cadeira.setComponents(List.of(compCadeira));

        when(productRepository.findAll()).thenReturn(new ArrayList<>(List.of(mesa, cadeira)));
        when(rawMaterialRepository.findAll()).thenReturn(List.of(madeira));

        var plano = service.calculateProductionPlan();

        assertEquals("Mesa", plano.get(0).getProductName());
        assertEquals(25, plano.get(0).getQuantity());
        assertEquals(BigDecimal.valueOf(12500.0), plano.get(0).getTotalValue());
    }

    @Test
    @DisplayName("Deve lidar graciosamente com estoque zerado")
    void shouldHandleZeroStockGracefully() {
        RawMaterial madeira = new RawMaterial();
        madeira.setId(1L);
        madeira.setName("Madeira");
        madeira.setStockQuantity(0);

        Product mesa = new Product();
        mesa.setName("Mesa");
        mesa.setValue(BigDecimal.valueOf(500.0));

        ProductComponent compMesa = new ProductComponent();
        compMesa.setRawMaterial(madeira);
        compMesa.setQuantityRequired(4);
        mesa.setComponents(List.of(compMesa));

        when(productRepository.findAll()).thenReturn(new ArrayList<>(List.of(mesa)));
        when(rawMaterialRepository.findAll()).thenReturn(List.of(madeira));

        var plano = service.calculateProductionPlan();

        assertEquals(0, plano.size());
    }

    @Test
    @DisplayName("Deve ignorar produtos com quantidade requerida inválida ou zero sem divisão por zero")
    void shouldIgnoreProductsWithInvalidOrZeroQuantityRequired() {
        RawMaterial madeira = new RawMaterial();
        madeira.setId(1L);
        madeira.setName("Madeira");
        madeira.setStockQuantity(50);

        Product mesa = new Product();
        mesa.setName("Mesa");
        mesa.setValue(BigDecimal.valueOf(500.0));

        ProductComponent compMesa = new ProductComponent();
        compMesa.setRawMaterial(madeira);
        compMesa.setQuantityRequired(0);
        mesa.setComponents(List.of(compMesa));

        when(productRepository.findAll()).thenReturn(new ArrayList<>(List.of(mesa)));
        when(rawMaterialRepository.findAll()).thenReturn(List.of(madeira));

        var plano = service.calculateProductionPlan();

        assertEquals(0, plano.size());
    }

    @Test
    @DisplayName("Deve distribuir sobras de estoque entre múltiplos produtos")
    void shouldDistributeStockAcrossMultipleProductsWhenStockRemains() {
        RawMaterial madeira = new RawMaterial();
        madeira.setId(1L);
        madeira.setName("Madeira");
        madeira.setStockQuantity(10);

        Product mesa = new Product();
        mesa.setName("Mesa");
        mesa.setValue(BigDecimal.valueOf(500.0));

        ProductComponent compMesa = new ProductComponent();
        compMesa.setRawMaterial(madeira);
        compMesa.setQuantityRequired(4);
        mesa.setComponents(List.of(compMesa));

        Product cadeira = new Product();
        cadeira.setName("Cadeira");
        cadeira.setValue(BigDecimal.valueOf(100.0));

        ProductComponent compCadeira = new ProductComponent();
        compCadeira.setRawMaterial(madeira);
        compCadeira.setQuantityRequired(2);
        cadeira.setComponents(List.of(compCadeira));

        when(productRepository.findAll()).thenReturn(new ArrayList<>(List.of(cadeira, mesa)));
        when(rawMaterialRepository.findAll()).thenReturn(List.of(madeira));

        var plano = service.calculateProductionPlan();

        assertEquals(2, plano.size());
        assertEquals("Mesa", plano.get(0).getProductName());
        assertEquals(2, plano.get(0).getQuantity());
        assertEquals("Cadeira", plano.get(1).getProductName());
        assertEquals(1, plano.get(1).getQuantity());
    }

    @Test
    @DisplayName("Deve executar produção com débito real de estoque e gerar Ordem de Produção")
    void shouldExecuteProductionPlanSuccessfully() {
        RawMaterial madeira = RawMaterial.builder().id(1L).name("Madeira").stockQuantity(10).build();
        Product mesa = Product.builder().id(1L).name("Mesa").value(BigDecimal.valueOf(500.0)).build();
        ProductComponent comp = ProductComponent.builder().rawMaterial(madeira).quantityRequired(4).build();
        mesa.setComponents(List.of(comp));

        when(productRepository.findAll()).thenReturn(new ArrayList<>(List.of(mesa)));
        when(rawMaterialRepository.findAll()).thenReturn(List.of(madeira));
        when(productionOrderRepository.save(any(ProductionOrder.class))).thenAnswer(invocation -> {
            ProductionOrder order = invocation.getArgument(0);
            order.setId(100L);
            order.setCreatedAt(LocalDateTime.now());
            return order;
        });

        ProductionOrderResponseDTO result = service.executeProductionPlan();

        assertNotNull(result);
        assertEquals(100L, result.id());
        assertEquals(2, result.totalItems()); // 2 mesas produzidas
        assertEquals(BigDecimal.valueOf(1000.0), result.totalValue()); // 2 * 500
        assertEquals(1, result.items().size());
        assertEquals(2, madeira.getStockQuantity()); // 10 - (2 * 4) = 2 restantes

        verify(rawMaterialRepository, times(1)).saveAll(any());
        verify(productionOrderRepository, times(1)).save(any(ProductionOrder.class));
    }

    @Test
    @DisplayName("Deve lançar BusinessRuleException ao tentar executar produção com estoque zerado")
    void shouldThrowExceptionWhenNoStockAvailableForExecution() {
        RawMaterial madeira = RawMaterial.builder().id(1L).name("Madeira").stockQuantity(0).build();
        Product mesa = Product.builder().id(1L).name("Mesa").value(BigDecimal.valueOf(500.0)).build();
        ProductComponent comp = ProductComponent.builder().rawMaterial(madeira).quantityRequired(4).build();
        mesa.setComponents(List.of(comp));

        when(productRepository.findAll()).thenReturn(new ArrayList<>(List.of(mesa)));
        when(rawMaterialRepository.findAll()).thenReturn(List.of(madeira));

        assertThrows(BusinessRuleException.class, () -> service.executeProductionPlan());
        verify(productionOrderRepository, never()).save(any());
    }
}