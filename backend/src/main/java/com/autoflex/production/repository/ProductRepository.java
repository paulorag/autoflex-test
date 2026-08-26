package com.autoflex.production.repository;

import com.autoflex.production.domain.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Override
    @EntityGraph(attributePaths = {"components", "components.rawMaterial"})
    List<Product> findAll();

    @Override
    @EntityGraph(attributePaths = {"components", "components.rawMaterial"})
    Optional<Product> findById(Long id);
}