package com.autoflex.production.repository;

import com.autoflex.production.domain.ProductComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductComponentRepository extends JpaRepository<ProductComponent, Long> {
}