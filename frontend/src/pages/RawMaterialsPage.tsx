import { useEffect, useState, useCallback } from "react";
import { Table, Alert, Spinner, Button, Row, Col, Form, Badge } from "react-bootstrap";
import { Plus, Search, Pencil, Trash2, Boxes, AlertTriangle, CheckCircle2, LogIn, Lock } from "lucide-react";
import { rawMaterialService } from "../services/rawMaterialService";
import type { RawMaterial } from "../types";
import { RawMaterialFormModal } from "../components/RawMaterialFormModal";
import { ConfirmModal } from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";

export function RawMaterialsPage() {
    const { token, isAuthenticated, user, openLoginModal } = useAuth();
    const [materials, setMaterials] = useState<RawMaterial[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [showFormModal, setShowFormModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const isAdmin = user?.role === "ROLE_ADMIN";

    const fetchMaterials = useCallback(() => {
        if (!token) return;
        setLoading(true);
        rawMaterialService.getAll()
            .then((data) => {
                setMaterials(data);
                setError(null);
            })
            .catch((err) => {
                console.error("Erro ao buscar dados:", err);
                if (err.response?.status === 401) {
                    setError("Sessão expirada. Por favor, autentique-se novamente.");
                } else {
                    setError("Erro ao carregar matérias-primas do servidor.");
                }
            })
            .finally(() => setLoading(false));
    }, [token]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchMaterials();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, fetchMaterials]);

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

    const totalStock = materials.reduce((acc, m) => acc + m.stockQuantity, 0);
    const lowStockCount = materials.filter((m) => m.stockQuantity <= 10).length;

    if (!isAuthenticated) {
        return (
            <div className="page-container">
                <Alert variant="warning" className="shadow-sm border-0 d-flex align-items-center justify-content-between p-4 mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <AlertTriangle size={28} className="text-warning" />
                        <div>
                            <h5 className="mb-1 fw-bold">Autenticação Necessária</h5>
                            <p className="mb-0 text-muted small">
                                O estoque de matérias-primas é protegido. Faça login para visualizar e gerenciar insumos.
                            </p>
                        </div>
                    </div>
                    <Button variant="primary" onClick={openLoginModal} className="d-flex align-items-center gap-2">
                        <LogIn size={16} /> Entrar no Sistema
                    </Button>
                </Alert>
            </div>
        );
    }

    return (
        <div className="page-container">
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)} className="shadow-sm border-0 d-flex align-items-center gap-2 mb-4">
                    <AlertTriangle size={20} />
                    <span className="fw-semibold">{error}</span>
                </Alert>
            )}

            {successMessage && (
                <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)} className="shadow-sm border-0 d-flex align-items-center gap-2 mb-4">
                    <CheckCircle2 size={20} />
                    <span className="fw-semibold">{successMessage}</span>
                </Alert>
            )}

            {/* Top Quick Stats */}
            <Row className="g-4 mb-4">
                <Col md={4}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box blue">
                            <Boxes size={28} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Tipos Cadastrados</div>
                            <div className="kpi-value">{materials.length}</div>
                            <div className="kpi-subtext">Variedade de componentes</div>
                        </div>
                    </div>
                </Col>

                <Col md={4}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box green">
                            <Boxes size={28} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Volume Total Físico</div>
                            <div className="kpi-value text-success">{totalStock.toLocaleString()} un</div>
                            <div className="kpi-subtext">Saldo consolidado</div>
                        </div>
                    </div>
                </Col>

                <Col md={4}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box amber">
                            <AlertTriangle size={28} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Atenção ao Estoque</div>
                            <div className="kpi-value text-danger">{lowStockCount}</div>
                            <div className="kpi-subtext">Com 10 unidades ou menos</div>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Main Action Bar and Search */}
            <div className="custom-card">
                <div className="custom-card-header flex-column flex-md-row gap-3">
                    <div className="position-relative flex-grow-1" style={{ maxWidth: "450px" }}>
                        <Search size={18} className="search-input-icon text-muted position-absolute" style={{ left: "12px", top: "10px" }} />
                        <Form.Control
                            type="text"
                            placeholder="Buscar insumo por nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: "38px" }}
                        />
                    </div>
                    {isAdmin ? (
                        <Button
                            className="btn-modern-primary d-flex align-items-center gap-2"
                            onClick={() => {
                                setEditingMaterial(null);
                                setShowFormModal(true);
                            }}
                        >
                            <Plus size={18} /> Nova Matéria-Prima
                        </Button>
                    ) : (
                        <div className="d-flex align-items-center gap-1.5 text-muted small bg-light px-3 py-2 rounded border" title="Apenas Administradores podem cadastrar insumos">
                            <Lock size={14} />
                            <span>Modo Somente Leitura (Operador)</span>
                        </div>
                    )}
                </div>

                <div className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Carregando matérias-primas...</p>
                        </div>
                    ) : filteredMaterials.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <Boxes size={48} className="text-muted mb-2 opacity-50" />
                            <h6>Nenhuma matéria-prima encontrada</h6>
                            <p className="small">Tente buscar por outro termo ou cadastre um novo item.</p>
                        </div>
                    ) : (
                        <Table responsive className="modern-table mb-0">
                            <thead>
                                <tr>
                                    <th style={{ width: "80px" }}>ID</th>
                                    <th>Nome da Matéria-Prima</th>
                                    <th className="text-center" style={{ width: "220px" }}>Saldo em Estoque</th>
                                    <th className="text-center" style={{ width: "160px" }}>Status</th>
                                    <th className="text-end" style={{ width: "140px" }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMaterials.map((item) => {
                                    const isLow = item.stockQuantity <= 10;
                                    const isZero = item.stockQuantity === 0;

                                    return (
                                        <tr key={item.id}>
                                            <td className="text-muted fw-bold">#{item.id}</td>
                                            <td className="fw-semibold text-dark">{item.name}</td>
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
                                                    <span className="badge-pill-custom badge-warning-soft">Nível Baixo</span>
                                                ) : (
                                                    <span className="badge-pill-custom badge-success-soft">Regular</span>
                                                )}
                                            </td>
                                            <td className="text-end">
                                                {isAdmin ? (
                                                    <>
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
                                                    </>
                                                ) : (
                                                    <Badge bg="light" text="dark" className="border">
                                                        Consulta
                                                    </Badge>
                                                )}
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
