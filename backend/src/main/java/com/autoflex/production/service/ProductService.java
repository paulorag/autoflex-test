package com.autoflex.production.service;

import com.autoflex.production.domain.Product;
import com.autoflex.production.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repository;

    public List<Product> findAll() {
        return repository.findAll();
    }

    public Optional<Product> findById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public Product save(Product product) {
        if (product.getComponents() != null) {
            product.getComponents().forEach(component -> component.setProduct(product));
        }

        return repository.save(product);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}