package com.autoflex.production.service;

import com.autoflex.production.domain.Product;
import com.autoflex.production.domain.ProductComponent;
import com.autoflex.production.domain.RawMaterial;
import com.autoflex.production.repository.ProductRepository;
import com.autoflex.production.repository.RawMaterialRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.ArrayList;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductionPlanningServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private RawMaterialRepository rawMaterialRepository;

    @InjectMocks
    private ProductionPlanningService service;

    @Test
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
    }
}