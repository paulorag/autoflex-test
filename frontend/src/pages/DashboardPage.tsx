import { useEffect, useState, useCallback } from "react";
import { Row, Col, Table, Button, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
    TrendingUp,
    Boxes,
    Wrench,
    ClipboardCheck,
    ArrowRight,
    AlertTriangle,
    Zap,
    CheckCircle2,
} from "lucide-react";
import { rawMaterialService } from "../services/rawMaterialService";
import { productService } from "../services/productService";
import { planningService } from "../services/planningService";
import { productionOrderService } from "../services/productionOrderService";
import type { RawMaterial, Product, ProductionPlan, ProductionOrder } from "../types";
import { ConfirmModal } from "../components/ConfirmModal";

export function DashboardPage() {
    const [materials, setMaterials] = useState<RawMaterial[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [plan, setPlan] = useState<ProductionPlan[]>([]);
    const [orders, setOrders] = useState<ProductionOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [notification, setNotification] = useState<{ type: "success" | "danger"; message: string } | null>(null);

    const loadDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const [matsData, prodsData, planData, ordersData] = await Promise.all([
                rawMaterialService.getAll(),
                productService.getAll(),
                planningService.getPlan(),
                productionOrderService.getAll(),
            ]);
            setMaterials(matsData);
            setProducts(prodsData);
            setPlan(planData);
            setOrders(ordersData);
        } catch (err) {
            console.error("Erro ao carregar dados do dashboard:", err);
            setNotification({ type: "danger", message: "Erro ao conectar com a API do servidor." });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const handleExecutePlan = async () => {
        setExecuting(true);
        try {
            const executed = await planningService.executePlan();
            setNotification({
                type: "success",
                message: `⚡ Ordem #${executed.id} efetivada com sucesso! ${executed.totalItems} produtos fabricados com baixa imediata no estoque de insumos.`,
            });
            setShowConfirmModal(false);
            loadDashboardData();
        } catch (err: any) {
            console.error("Erro ao efetivar produção:", err);
            const msg = err.response?.data?.message || "Erro ao efetivar o plano de produção.";
            setNotification({ type: "danger", message: msg });
            setShowConfirmModal(false);
        } finally {
            setExecuting(false);
        }
    };

    const totalPotentialRevenue = plan.reduce((acc, item) => acc + item.totalValue, 0);
    const totalPlannedUnits = plan.reduce((acc, item) => acc + item.quantity, 0);
    const lowStockCount = materials.filter((m) => m.stockQuantity < 10).length;

    return (
        <div className="page-container">
            {notification && (
                <Alert
                    variant={notification.type}
                    dismissible
                    onClose={() => setNotification(null)}
                    className="shadow-sm border-0 d-flex align-items-center gap-2 mb-4"
                >
                    {notification.type === "success" ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                    <span className="fw-semibold">{notification.message}</span>
                </Alert>
            )}

            {/* KPI Cards Row */}
            <Row className="g-4 mb-4">
                <Col xl={3} md={6}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box green">
                            <TrendingUp size={28} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Faturamento Projetado</div>
                            <div className="kpi-value text-success">
                                R$ {totalPotentialRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </div>
                            <div className="kpi-subtext">
                                <span>{totalPlannedUnits} unidades planejadas</span>
                            </div>
                        </div>
                    </div>
                </Col>

                <Col xl={3} md={6}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box blue">
                            <Boxes size={28} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Insumos em Estoque</div>
                            <div className="kpi-value">{materials.length} tipos</div>
                            <div className="kpi-subtext">
                                {lowStockCount > 0 ? (
                                    <span className="text-danger fw-semibold">⚠️ {lowStockCount} em nível crítico</span>
                                ) : (
                                    <span className="text-success">Níveis regulares</span>
                                )}
                            </div>
                        </div>
                    </div>
                </Col>

                <Col xl={3} md={6}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box indigo">
                            <Wrench size={28} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Produtos Cadastrados</div>
                            <div className="kpi-value">{products.length} itens</div>
                            <div className="kpi-subtext">
                                <span>Com fichas técnicas ativas</span>
                            </div>
                        </div>
                    </div>
                </Col>

                <Col xl={3} md={6}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box amber">
                            <ClipboardCheck size={28} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Ordens Realizadas</div>
                            <div className="kpi-value">{orders.length} ordens</div>
                            <div className="kpi-subtext">
                                <span>Histórico rastreado</span>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Carregando indicadores industriais...</p>
                </div>
            ) : (
                <Row className="g-4">
                    {/* Left Column: Production Planning Preview */}
                    <Col lg={7}>
                        <div className="custom-card h-100">
                            <div className="custom-card-header">
                                <div>
                                    <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                        <Zap size={20} className="text-warning" />
                                        Sugestão de Fabricação (Plano Otimizado)
                                    </h5>
                                    <small className="text-muted">Priorização inteligente por maior margem e liquidez</small>
                                </div>
                                {plan.length > 0 && (
                                    <Button
                                        className="btn-modern-success btn-sm"
                                        onClick={() => setShowConfirmModal(true)}
                                        disabled={executing}
                                    >
                                        <Zap size={16} /> Efetivar Produção
                                    </Button>
                                )}
                            </div>
                            <div className="p-0">
                                {plan.length === 0 ? (
                                    <div className="text-center p-5 text-muted">
                                        <AlertTriangle size={36} className="text-warning mb-2" />
                                        <h6>Estoque insuficiente para produzir</h6>
                                        <p className="small mb-3">Reabasteça suas matérias-primas para que o PCP volte a sugerir fabricação.</p>
                                        <Link to="/raw-materials" className="btn btn-outline-primary btn-sm">
                                            Ir para Matérias-Primas
                                        </Link>
                                    </div>
                                ) : (
                                    <Table responsive className="modern-table mb-0">
                                        <thead>
                                            <tr>
                                                <th>Produto</th>
                                                <th className="text-center">Quantidade</th>
                                                <th className="text-end">Receita Esperada</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {plan.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="fw-bold">{item.productName}</td>
                                                    <td className="text-center">
                                                        <span className="badge-pill-custom badge-success-soft">
                                                            {item.quantity} unidades
                                                        </span>
                                                    </td>
                                                    <td className="text-end fw-bold text-success">
                                                        R$ {item.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                            </div>
                            <div className="custom-card-header bg-light border-top border-0">
                                <Link to="/planning" className="text-primary text-decoration-none fw-semibold small d-flex align-items-center gap-1">
                                    Ver Detalhes do Planejamento Completo <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </Col>

                    {/* Right Column: Raw Materials Stock Health */}
                    <Col lg={5}>
                        <div className="custom-card h-100">
                            <div className="custom-card-header">
                                <div>
                                    <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                        <Boxes size={20} className="text-primary" />
                                        Saúde do Estoque de Insumos
                                    </h5>
                                    <small className="text-muted">Nível físico disponível no almoxarifado</small>
                                </div>
                                <Link to="/raw-materials" className="btn btn-outline-secondary btn-sm">
                                    Gerenciar
                                </Link>
                            </div>
                            <div className="p-0">
                                {materials.length === 0 ? (
                                    <div className="text-center p-5 text-muted">
                                        <p className="mb-2">Nenhuma matéria-prima cadastrada.</p>
                                        <Link to="/raw-materials" className="btn btn-primary btn-sm">
                                            + Cadastrar Insumo
                                        </Link>
                                    </div>
                                ) : (
                                    <Table responsive className="modern-table mb-0">
                                        <thead>
                                            <tr>
                                                <th>Insumo</th>
                                                <th className="text-center">Disponibilidade</th>
                                                <th className="text-end">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {materials.slice(0, 5).map((mat) => {
                                                const isLow = mat.stockQuantity <= 10;
                                                const isZero = mat.stockQuantity === 0;
                                                return (
                                                    <tr key={mat.id}>
                                                        <td className="fw-semibold">{mat.name}</td>
                                                        <td className="text-center">
                                                            <div className="stock-progress-container mx-auto">
                                                                <div className="d-flex justify-content-between small fw-bold">
                                                                    <span>{mat.stockQuantity} un</span>
                                                                </div>
                                                                <div className="stock-progress-bar">
                                                                    <div
                                                                        className="stock-progress-fill"
                                                                        style={{
                                                                            width: `${Math.min(100, Math.max(5, mat.stockQuantity))}%`,
                                                                            backgroundColor: isZero ? "#ef4444" : isLow ? "#f59e0b" : "#10b981",
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-end">
                                                            {isZero ? (
                                                                <span className="badge-pill-custom badge-danger-soft">Esgotado</span>
                                                            ) : isLow ? (
                                                                <span className="badge-pill-custom badge-warning-soft">Baixo</span>
                                                            ) : (
                                                                <span className="badge-pill-custom badge-success-soft">Regular</span>
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
                    </Col>
                </Row>
            )}

            <ConfirmModal
                show={showConfirmModal}
                title="⚡ Efetivar Ordem de Produção"
                message={`Deseja confirmar a execução do plano atual de ${totalPlannedUnits} produtos no valor total de R$ ${totalPotentialRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}? O estoque físico de insumos será baixado automaticamente.`}
                confirmText="Efetivar e Baixar Insumos"
                variant="success"
                isLoading={executing}
                onConfirm={handleExecutePlan}
                onCancel={() => setShowConfirmModal(false)}
            />
        </div>
    );
}
