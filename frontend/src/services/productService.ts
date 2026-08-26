import api from "./api";
import type { Product, ProductRequest } from "../types";

export const productService = {
    async getAll(): Promise<Product[]> {
        const response = await api.get<Product[]>("/products");
        return response.data;
    },

    async getById(id: number): Promise<Product> {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    },

    async create(data: ProductRequest): Promise<Product> {
        const response = await api.post<Product>("/products", data);
        return response.data;
    },

    async update(id: number, data: ProductRequest): Promise<Product> {
        const response = await api.put<Product>(`/products/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/products/${id}`);
    },
};
