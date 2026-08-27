-- =======================================================
-- Migration V4: Alinhamento das sequences de identity para evitar conflito de chave primária
-- =======================================================

ALTER TABLE raw_materials ALTER COLUMN id RESTART WITH 100;
ALTER TABLE products ALTER COLUMN id RESTART WITH 100;
ALTER TABLE product_components ALTER COLUMN id RESTART WITH 100;
