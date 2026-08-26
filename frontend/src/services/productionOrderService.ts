import api from "./api";
import type { ProductionOrder } from "../types";

export const productionOrderService = {
    async getAll(): Promise<ProductionOrder[]> {
        const response = await api.get<ProductionOrder[]>("/production-orders");
        return response.data;
    },

    async getById(id: number): Promise<ProductionOrder> {
        const response = await api.get<ProductionOrder>(`/production-orders/${id}`);
        return response.data;
    },
};
