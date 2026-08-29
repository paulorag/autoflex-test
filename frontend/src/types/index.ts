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

export type UserRole = "ROLE_ADMIN" | "ROLE_OPERATOR";

export interface AuthUser {
    id: number;
    username: string;
    name: string;
    role: UserRole;
}

export interface AuthResponse {
    token: string;
    tokenType: string;
    id: number;
    username: string;
    name: string;
    role: UserRole;
    expiresIn: number;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    name: string;
    role: UserRole;
}

export interface ApiError {
    timestamp?: string;
    status?: number;
    error?: string;
    message?: string;
    fieldErrors?: Record<string, string>;
}
