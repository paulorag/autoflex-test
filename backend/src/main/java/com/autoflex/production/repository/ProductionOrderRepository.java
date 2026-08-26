package com.autoflex.production.repository;

import com.autoflex.production.domain.ProductionOrder;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductionOrderRepository extends JpaRepository<ProductionOrder, Long> {

    @EntityGraph(attributePaths = {"items", "items.product"})
    List<ProductionOrder> findAllByOrderByCreatedAtDesc();
}
