export interface RawMaterial {
    id: number;
    name: string;
    stockQuantity: number;
}

export interface RawMaterialRequest {
    name: string;
    stockQuantity: number;
}

export interface ProductComponent {
    id?: number;
    rawMaterial: RawMaterial;
    quantityRequired: number;
}

export interface ProductComponentRequest {
    rawMaterialId: number;
    quantityRequired: number;
}

export interface Product {
    id: number;
    name: string;
    value: number;
    components: ProductComponent[];
}

export interface ProductRequest {
    name: string;
    value: number;
    components: ProductComponentRequest[];
}

export interface ProductionPlan {
    productName: string;
    quantity: number;
    totalValue: number;
}

export interface ProductionOrderItem {
    id: number;
    productId?: number;
    productName: string;
    unitValue: number;
    quantity: number;
    subtotal: number;
}

export interface ProductionOrder {
    id: number;
    createdAt: string;
    totalValue: number;
    totalItems: number;
    status: string;
    items: ProductionOrderItem[];
}

export interface ApiError {
    timestamp?: string;
    status?: number;
    error?: string;
    message?: string;
    fieldErrors?: Record<string, string>;
}
