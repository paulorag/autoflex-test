import { useEffect, useState, useCallback } from "react";
import { Container, Table, Badge, Card, Spinner, Alert, Button, Accordion } from "react-bootstrap";
import { productionOrderService } from "../services/productionOrderService";
import { type ProductionOrder } from "../types";

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
                setError("Erro ao carregar histórico de ordens de produção.");
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

    return (
        <Container className="py-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">📜 Histórico de Ordens de Produção</h2>
                    <p className="text-muted mb-0">Rastreabilidade completa de todas as produções efetivadas no chão de fábrica.</p>
                </div>
                <Button variant="outline-secondary" onClick={fetchOrders} disabled={loading}>
                    🔄 Atualizar
                </Button>
            </div>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Carregando histórico de ordens...</p>
                </div>
            ) : orders.length === 0 ? (
                <Card className="text-center p-5 shadow-sm border-0 bg-light">
                    <Card.Body>
                        <h4 className="text-muted">Nenhuma ordem de produção realizada</h4>
                        <p className="text-muted">
                            Quando você efetivar um plano na aba <strong>Planejamento</strong>, o registro detalhado aparecerá aqui.
                        </p>
                    </Card.Body>
                </Card>
            ) : (
                <Accordion defaultActiveKey="0" className="shadow-sm">
                    {orders.map((order, index) => (
                        <Accordion.Item eventKey={String(index)} key={order.id} className="mb-2 border rounded">
                            <Accordion.Header>
                                <div className="d-flex justify-content-between align-items-center w-100 me-3">
                                    <div>
                                        <span className="fw-bold fs-6 me-2">Ordem #{order.id}</span>
                                        <span className="text-muted small">({formatDate(order.createdAt)})</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <Badge bg="info" className="fs-6">{order.totalItems} itens</Badge>
                                        <span className="fw-bold text-success fs-6">
                                            R$ {order.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </span>
                                        <Badge bg="success">CONCLUÍDA</Badge>
                                    </div>
                                </div>
                            </Accordion.Header>
                            <Accordion.Body className="bg-light">
                                <h6 className="fw-bold mb-2">Itens Fabricados:</h6>
                                <Table size="sm" bordered responsive className="bg-white align-middle mb-0">
                                    <thead className="table-secondary">
                                        <tr>
                                            <th>Produto</th>
                                            <th className="text-center" style={{ width: "140px" }}>Quantidade</th>
                                            <th className="text-end" style={{ width: "160px" }}>Valor Unitário</th>
                                            <th className="text-end" style={{ width: "180px" }}>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="fw-semibold">{item.productName}</td>
                                                <td className="text-center">
                                                    <Badge bg="dark">{item.quantity} un</Badge>
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
        </Container>
    );
}
