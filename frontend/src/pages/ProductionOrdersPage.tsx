import { useEffect, useState, useCallback } from "react";
import { Accordion, Table, Alert, Spinner, Row, Col, Button } from "react-bootstrap";
import { ClipboardCheck, Calendar, DollarSign, Package, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { productionOrderService } from "../services/productionOrderService";
import type { ProductionOrder } from "../types";

export function ProductionOrdersPage() {
    const [orders, setOrders] = useState<ProductionOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(() => {
        setLoading(true);
        productionOrderService.getAll()
            .then((data) => {
                setOrders(data);
                setError(null);
            })
            .catch((err) => {
                console.error("Erro ao carregar ordens de produção:", err);
                setError("Erro ao carregar histórico de ordens de produção do servidor.");
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

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
                            <ClipboardCheck size={26} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Ordens Realizadas</div>
                            <div className="kpi-value">{orders.length} ordens</div>
                        </div>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box green">
                            <DollarSign size={26} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Faturamento Total Realizado</div>
                            <div className="kpi-value text-success">
                                R$ {totalRealizedRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box blue">
                            <Package size={26} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Itens Fabricados</div>
                            <div className="kpi-value">{totalManufacturedItems} unidades</div>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Main Orders List */}
            <div className="custom-card">
                <div className="custom-card-header flex-wrap gap-3">
                    <div>
                        <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                            <ClipboardCheck size={20} className="text-primary" />
                            Histórico de Ordens de Produção
                        </h5>
                        <small className="text-muted">Registro detalhado com rastreabilidade de produtos e valores</small>
                    </div>
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        className="d-flex align-items-center gap-1"
                        onClick={fetchOrders}
                        disabled={loading}
                    >
                        <RefreshCw size={15} /> Atualizar Histórico
                    </Button>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Carregando histórico de ordens...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center p-5 text-muted">
                            <ClipboardCheck size={42} className="text-muted mb-2 opacity-50" />
                            <h5>Nenhuma ordem de produção realizada até o momento</h5>
                            <p className="small">
                                Quando você efetivar um plano na aba <strong>Planejamento PCP</strong>, o histórico completo ficará registrado aqui.
                            </p>
                        </div>
                    ) : (
                        <Accordion defaultActiveKey="0" className="d-flex flex-column gap-3">
                            {orders.map((order, index) => (
                                <Accordion.Item
                                    eventKey={String(index)}
                                    key={order.id}
                                    className="border rounded-3 overflow-hidden shadow-sm"
                                >
                                    <Accordion.Header>
                                        <div className="d-flex justify-content-between align-items-center w-100 me-3 flex-wrap gap-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="badge-pill-custom badge-primary-soft fw-bold">
                                                    Ordem #{order.id}
                                                </span>
                                                <span className="text-muted small d-flex align-items-center gap-1">
                                                    <Calendar size={14} /> {formatDate(order.createdAt)}
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center gap-3">
                                                <span className="badge-pill-custom badge-indigo-soft">
                                                    {order.totalItems} peças fabricadas
                                                </span>
                                                <span className="fw-bold text-success fs-6">
                                                    R$ {order.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                </span>
                                                <span className="badge-pill-custom badge-success-soft">
                                                    <CheckCircle2 size={14} /> CONCLUÍDA
                                                </span>
                                            </div>
                                        </div>
                                    </Accordion.Header>
                                    <Accordion.Body className="bg-light p-3">
                                        <h6 className="fw-bold mb-3 text-secondary">📋 Composição da Ordem:</h6>
                                        <Table size="sm" responsive className="modern-table bg-white rounded border">
                                            <thead>
                                                <tr>
                                                    <th>Produto Fabricado</th>
                                                    <th className="text-center" style={{ width: "160px" }}>Quantidade</th>
                                                    <th className="text-end" style={{ width: "180px" }}>Preço Unitário</th>
                                                    <th className="text-end" style={{ width: "200px" }}>Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.items.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="fw-semibold">{item.productName}</td>
                                                        <td className="text-center">
                                                            <span className="badge-pill-custom badge-slate-soft">
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
