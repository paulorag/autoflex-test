import { useEffect, useState, useCallback } from "react";
import { Table, Alert, Spinner, Button, Row, Col, Form } from "react-bootstrap";
import { Plus, Search, Pencil, Trash2, Boxes, AlertTriangle, CheckCircle2 } from "lucide-react";
import { rawMaterialService } from "../services/rawMaterialService";
import type { RawMaterial } from "../types";
import { RawMaterialFormModal } from "../components/RawMaterialFormModal";
import { ConfirmModal } from "../components/ConfirmModal";

export function RawMaterialsPage() {
    const [materials, setMaterials] = useState<RawMaterial[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [showFormModal, setShowFormModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchMaterials = useCallback(() => {
        setLoading(true);
        rawMaterialService.getAll()
            .then((data) => {
                setMaterials(data);
                setError(null);
            })
            .catch((err) => {
                console.error("Erro ao buscar dados:", err);
                setError("Erro ao carregar matérias-primas do servidor.");
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const handleConfirmDelete = async () => {
        if (!deletingId) return;

        setIsDeleting(true);
        try {
            await rawMaterialService.delete(deletingId);
            setSuccessMessage("Matéria-prima excluída com sucesso!");
            setTimeout(() => setSuccessMessage(null), 4000);
            fetchMaterials();
            setDeletingId(null);
        } catch (err: any) {
            console.error(err);
            const serverMessage = err.response?.data?.message || "Erro ao excluir matéria-prima. Verifique se não está em uso.";
            setError(serverMessage);
            setDeletingId(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredMaterials = materials.filter((m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalStockQuantity = materials.reduce((acc, m) => acc + m.stockQuantity, 0);
    const zeroStockCount = materials.filter((m) => m.stockQuantity === 0).length;

    return (
        <div className="page-container">
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)} className="shadow-sm border-0 d-flex align-items-center gap-2 mb-4">
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                </Alert>
            )}

            {successMessage && (
                <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)} className="shadow-sm border-0 d-flex align-items-center gap-2 mb-4">
                    <CheckCircle2 size={20} />
                    <span>{successMessage}</span>
                </Alert>
            )}

            {/* Quick Metrics */}
            <Row className="g-4 mb-4">
                <Col md={4}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box blue">
                            <Boxes size={24} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Tipos de Insumos</div>
                            <div className="kpi-value">{materials.length} cadastrados</div>
                        </div>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box green">
                            <CheckCircle2 size={24} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Volume Total Físico</div>
                            <div className="kpi-value text-success">{totalStockQuantity} unidades</div>
                        </div>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box rose">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Itens com Estoque Zerado</div>
                            <div className="kpi-value text-danger">{zeroStockCount} insumos</div>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Main Table Card */}
            <div className="custom-card">
                <div className="custom-card-header flex-wrap gap-3">
                    <div className="search-input-wrapper">
                        <Search size={16} className="search-input-icon" />
                        <Form.Control
                            type="text"
                            placeholder="Buscar matéria-prima por nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        className="btn-modern-primary"
                        onClick={() => {
                            setEditingMaterial(null);
                            setShowFormModal(true);
                        }}
                    >
                        <Plus size={18} /> Nova Matéria-Prima
                    </Button>
                </div>

                <div className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Carregando estoque de insumos...</p>
                        </div>
                    ) : filteredMaterials.length === 0 ? (
                        <div className="text-center p-5 text-muted">
                            <Boxes size={42} className="text-muted mb-2 opacity-50" />
                            <h5>Nenhuma matéria-prima encontrada</h5>
                            <p className="small mb-3">
                                {searchTerm ? "Nenhum resultado para os termos pesquisados." : "Cadastre sua primeira matéria-prima para alimentar as receitas de produção."}
                            </p>
                            {!searchTerm && (
                                <Button
                                    className="btn-modern-primary btn-sm"
                                    onClick={() => {
                                        setEditingMaterial(null);
                                        setShowFormModal(true);
                                    }}
                                >
                                    <Plus size={16} /> Cadastrar Insumo
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Table responsive className="modern-table mb-0">
                            <thead>
                                <tr>
                                    <th style={{ width: "90px" }}>ID</th>
                                    <th>Nome do Insumo / Matéria-Prima</th>
                                    <th className="text-center" style={{ width: "240px" }}>Disponibilidade</th>
                                    <th className="text-center" style={{ width: "160px" }}>Status</th>
                                    <th className="text-end" style={{ width: "160px" }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMaterials.map((item) => {
                                    const isZero = item.stockQuantity === 0;
                                    const isLow = item.stockQuantity <= 10;
                                    return (
                                        <tr key={item.id}>
                                            <td className="text-muted fw-bold">#{item.id}</td>
                                            <td className="fw-semibold fs-6">{item.name}</td>
                                            <td className="text-center">
                                                <div className="stock-progress-container mx-auto">
                                                    <div className="d-flex justify-content-between small fw-bold">
                                                        <span>{item.stockQuantity} un</span>
                                                    </div>
                                                    <div className="stock-progress-bar">
                                                        <div
                                                            className="stock-progress-fill"
                                                            style={{
                                                                width: `${Math.min(100, Math.max(5, item.stockQuantity))}%`,
                                                                backgroundColor: isZero ? "#ef4444" : isLow ? "#f59e0b" : "#10b981",
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                {isZero ? (
                                                    <span className="badge-pill-custom badge-danger-soft">Esgotado</span>
                                                ) : isLow ? (
                                                    <span className="badge-pill-custom badge-warning-soft">Estoque Baixo</span>
                                                ) : (
                                                    <span className="badge-pill-custom badge-success-soft">Em Estoque</span>
                                                )}
                                            </td>
                                            <td className="text-end">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => {
                                                        setEditingMaterial(item);
                                                        setShowFormModal(true);
                                                    }}
                                                    title="Editar insumo"
                                                >
                                                    <Pencil size={14} />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => setDeletingId(item.id)}
                                                    title="Excluir insumo"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                </div>
            </div>

            {showFormModal && (
                <RawMaterialFormModal
                    show={showFormModal}
                    handleClose={() => {
                        setShowFormModal(false);
                        setEditingMaterial(null);
                    }}
                    onSuccess={() => {
                        setSuccessMessage(editingMaterial ? "Matéria-prima atualizada com sucesso!" : "Matéria-prima cadastrada com sucesso!");
                        setTimeout(() => setSuccessMessage(null), 4000);
                        fetchMaterials();
                    }}
                    editingMaterial={editingMaterial}
                />
            )}

            <ConfirmModal
                show={deletingId !== null}
                title="⚠️ Confirmar Exclusão de Insumo"
                message="Tem certeza que deseja excluir esta matéria-prima? Caso ela esteja vinculada a fichas técnicas de produtos, a exclusão será bloqueada para preservar a integridade das receitas."
                confirmText="Sim, Excluir"
                variant="danger"
                isLoading={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeletingId(null)}
            />
        </div>
    );
}
