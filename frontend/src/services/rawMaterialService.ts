import api from "./api";
import type { RawMaterial, RawMaterialRequest } from "../types";

export const rawMaterialService = {
    async getAll(): Promise<RawMaterial[]> {
        const response = await api.get<RawMaterial[]>("/raw-materials");
        return response.data;
    },

    async getById(id: number): Promise<RawMaterial> {
        const response = await api.get<RawMaterial>(`/raw-materials/${id}`);
        return response.data;
    },

    async create(data: RawMaterialRequest): Promise<RawMaterial> {
        const response = await api.post<RawMaterial>("/raw-materials", data);
        return response.data;
    },

    async update(id: number, data: RawMaterialRequest): Promise<RawMaterial> {
        const response = await api.put<RawMaterial>(`/raw-materials/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/raw-materials/${id}`);
    },
};
