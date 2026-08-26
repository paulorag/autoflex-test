-- =======================================================
-- Migration V2: Carga de dados iniciais para testes e demonstração
-- =======================================================

INSERT INTO raw_materials (id, name, stock_quantity) VALUES
(1, 'Chapa de Madeira Maciça', 120),
(2, 'Parafuso Estrutural 50mm', 800),
(3, 'Tubo de Aço Carbono', 60),
(4, 'Verniz Protetor (L)', 40);

INSERT INTO products (id, name, "value") VALUES
(1, 'Mesa Executiva de Luxo', 750.00),
(2, 'Cadeira Ergonômica de Escritório', 280.00),
(3, 'Estante Industrial de Aço e Madeira', 490.00);

-- Receita: Mesa Executiva de Luxo (id 1) -> 4 Madeiras, 16 Parafusos, 2 Verniz
INSERT INTO product_components (product_id, raw_material_id, quantity_required) VALUES
(1, 1, 4),
(1, 2, 16),
(1, 4, 2);

-- Receita: Cadeira Ergonômica (id 2) -> 1 Madeira, 8 Parafusos, 2 Tubos de Aço
INSERT INTO product_components (product_id, raw_material_id, quantity_required) VALUES
(2, 1, 1),
(2, 2, 8),
(2, 3, 2);

-- Receita: Estante Industrial (id 3) -> 3 Madeiras, 12 Parafusos, 4 Tubos de Aço, 1 Verniz
INSERT INTO product_components (product_id, raw_material_id, quantity_required) VALUES
(3, 1, 3),
(3, 2, 12),
(3, 3, 4),
(3, 4, 1);
