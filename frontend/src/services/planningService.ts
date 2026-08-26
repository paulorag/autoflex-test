import api from "./api";
import type { ProductionPlan, ProductionOrder } from "../types";

export const planningService = {
    async getPlan(): Promise<ProductionPlan[]> {
        const response = await api.get<ProductionPlan[]>("/production-planning");
        return response.data;
    },

    async executePlan(): Promise<ProductionOrder> {
        const response = await api.post<ProductionOrder>("/production-planning/execute");
        return response.data;
    },
};
