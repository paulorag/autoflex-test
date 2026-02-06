export interface RawMaterial {
    id?: number;
    name: string;
    stockQuantity: number;
}

export interface ProductComponent {
    id?: number;
    rawMaterial: RawMaterial;
    quantityRequired: number;
}

export interface Product {
    id?: number;
    name: string;
    value: number;
    components: ProductComponent[];
}

export interface ProductionPlan {
    productName: string;
    quantity: number;
    totalValue: number;
}
