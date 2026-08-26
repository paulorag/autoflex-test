package com.autoflex.production.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
@ToString(exclude = "components")
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "\"value\"", nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProductComponent> components = new ArrayList<>();

    public void addComponent(ProductComponent component) {
        components.add(component);
        component.setProduct(this);
    }

    public void removeComponent(ProductComponent component) {
        components.remove(component);
        component.setProduct(null);
    }
}