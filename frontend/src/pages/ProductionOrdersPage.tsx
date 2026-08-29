import { useEffect, useState, useCallback } from "react";
import { Accordion, Table, Alert, Spinner, Row, Col, Button } from "react-bootstrap";
import { ClipboardCheck, Calendar, DollarSign, Package, RefreshCw, AlertTriangle, LogIn } from "lucide-react";
import { productionOrderService } from "../services/productionOrderService";
import type { ProductionOrder } from "../types";
import { useAuth } from "../context/AuthContext";

export function ProductionOrdersPage() {
    const { token, isAuthenticated, openLoginModal } = useAuth();
    const [orders, setOrders] = useState<ProductionOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(() => {
        if (!token) return;
        setLoading(true);
        productionOrderService.getAll()
            .then((data) => {
                setOrders(data);
                setError(null);
            })
            .catch((err) => {
                console.error("Erro ao carregar ordens de produção:", err);
                if (err.response?.status === 401) {
                    setError("Sessão expirada. Por favor, faça login novamente.");
                } else {
                    setError("Erro ao carregar histórico de ordens de produção do servidor.");
                }
            })
            .finally(() => setLoading(false));
    }, [token]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, fetchOrders]);

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    const totalRealizedRevenue = orders.reduce((acc, o) => acc + o.totalValue, 0);
    const totalManufacturedItems = orders.reduce((acc, o) => acc + o.totalItems, 0);

    if (!isAuthenticated) {
        return (
            <div className="page-container">
                <Alert variant="warning" className="shadow-sm border-0 d-flex align-items-center justify-content-between p-4 mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <AlertTriangle size={28} className="text-warning" />
                        <div>
                            <h5 className="mb-1 fw-bold">Autenticação Necessária</h5>
                            <p className="mb-0 text-muted small">
                                O histórico e a rastreabilidade de ordens fabris são confidenciais. Faça login para consultar.
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
                    <span>{error}</span>
                </Alert>
            )}

            {/* Quick Metrics */}
            <Row className="g-4 mb-4">
                <Col md={4}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box amber">
                            <ClipboardCheck size={28} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Total de Ordens Efetivadas</div>
                            <div className="kpi-value">{orders.length}</div>
                            <div className="kpi-subtext">Histórico completo de batches</div>
                        </div>
                    </div>
                </Col>

                <Col md={4}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box green">
                            <DollarSign size={28} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Faturamento Total Realizado</div>
                            <div className="kpi-value text-success">
                                R$ {totalRealizedRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </div>
                            <div className="kpi-subtext">Volume produzido e consolidado</div>
                        </div>
                    </div>
                </Col>

                <Col md={4}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box blue">
                            <Package size={28} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Produtos Fabricados</div>
                            <div className="kpi-value">{totalManufacturedItems.toLocaleString()} un</div>
                            <div className="kpi-subtext">Total de itens acabados</div>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Orders Timeline / Accordion */}
            <div className="custom-card">
                <div className="custom-card-header flex-column flex-md-row gap-3">
                    <div>
                        <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                            <ClipboardCheck size={22} className="text-primary" />
                            Rastreabilidade Cronológica de Ordens
                        </h5>
                        <small className="text-muted">Registro auditável de todas as baixas de matérias-primas e produções</small>
                    </div>

                    <Button
                        variant="outline-secondary"
                        className="d-flex align-items-center gap-1 btn-sm"
                        onClick={fetchOrders}
                        disabled={loading}
                    >
                        <RefreshCw size={14} className={loading ? "spin" : ""} /> Atualizar
                    </Button>
                </div>

                <div className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Carregando histórico e rastreabilidade...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <ClipboardCheck size={48} className="text-muted mb-2 opacity-50" />
                            <h6>Nenhuma ordem de produção realizada até o momento</h6>
                            <p className="small">Quando você efetivar um plano no Dashboard ou na tela de Planejamento, o histórico aparecerá aqui.</p>
                        </div>
                    ) : (
                        <Accordion defaultActiveKey="0" className="modern-accordion">
                            {orders.map((order, idx) => (
                                <Accordion.Item eventKey={idx.toString()} key={order.id} className="border-bottom">
                                    <Accordion.Header>
                                        <div className="d-flex justify-content-between align-items-center w-100 me-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <span className="badge-pill-custom badge-success-soft fw-bold">
                                                    Ordem #{order.id}
                                                </span>
                                                <div className="text-muted small d-flex align-items-center gap-1">
                                                    <Calendar size={14} />
                                                    {formatDate(order.createdAt)}
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center gap-4">
                                                <div className="small text-muted d-none d-md-block">
                                                    {order.totalItems} produtos fabricados
                                                </div>
                                                <div className="fw-bold text-success fs-6">
                                                    R$ {order.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        </div>
                                    </Accordion.Header>
                                    <Accordion.Body className="p-0">
                                        <div className="p-3 bg-light border-bottom">
                                            <h6 className="small text-uppercase fw-bold text-muted mb-0">Itens Produzidos neste Lote:</h6>
                                        </div>
                                        <Table responsive className="modern-table mb-0 bg-white">
                                            <thead>
                                                <tr>
                                                    <th>Produto Acabado</th>
                                                    <th className="text-center">Quantidade Produzida</th>
                                                    <th className="text-end">Preço Unitário</th>
                                                    <th className="text-end">Subtotal Realizado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.items.map((item, itemIdx) => (
                                                    <tr key={itemIdx}>
                                                        <td className="fw-semibold text-dark">{item.productName}</td>
                                                        <td className="text-center">
                                                            <span className="badge bg-light text-dark border">
                                                                {item.quantity} un
                                                            </span>
                                                        </td>
                                                        <td className="text-end">
                                                            R$ {item.unitValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="text-end fw-bold text-success">
                                                            R$ {item.subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    )}
                </div>
            </div>
        </div>
    );
}
