import { useEffect, useState, useCallback } from "react";
import { Table, Card, Alert, Badge, Button, Spinner, Container } from "react-bootstrap";
import { planningService } from "../services/planningService";
import { type ProductionPlan } from "../types";
import { ConfirmModal } from "../components/ConfirmModal";

export function PlanningPage() {
    const [plan, setPlan] = useState<ProductionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchPlan = useCallback(() => {
        setLoading(true);
        planningService.getPlan()
            .then((data) => {
                setPlan(data);
                setError(null);
            })
            .catch((err) => {
                console.error("Erro ao carregar planejamento:", err);
                setError("Erro ao calcular planejamento de produção.");
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchPlan();
    }, [fetchPlan]);

    const handleExecuteProduction = async () => {
        setExecuting(true);
        try {
            const order = await planningService.executePlan();
            setSuccessMessage(
                `⚡ Produção executada com sucesso! Ordem de Produção #${order.id} gerada com ${order.totalItems} itens fabricados e baixa realizada no estoque.`
            );
            setShowConfirmModal(false);
            fetchPlan();
        } catch (err: any) {
            console.error("Erro ao efetivar produção:", err);
            const msg = err.response?.data?.message || "Erro ao efetivar a produção.";
            setError(msg);
            setShowConfirmModal(false);
        } finally {
            setExecuting(false);
        }
    };

    const totalValueAll = plan.reduce((acc, item) => acc + item.totalValue, 0);
    const totalUnitsAll = plan.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <Container className="py-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">📊 Planejamento de Produção Otimizado</h2>
                    <p className="text-muted mb-0">
                        O algoritmo analisa o estoque disponível e prioriza produtos de <strong>maior valor comercial</strong>.
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-secondary"
                        onClick={fetchPlan}
                        disabled={loading || executing}
                    >
                        🔄 Atualizar
                    </Button>
                    <Button
                        variant="success"
                        className="fw-bold shadow-sm px-3"
                        disabled={loading || executing || plan.length === 0}
                        onClick={() => setShowConfirmModal(true)}
                    >
                        ⚡ Efetivar Produção
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {successMessage && (
                <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
                    {successMessage}
                </Alert>
            )}

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Calculando capacidade produtiva...</p>
                </div>
            ) : plan.length === 0 ? (
                <Card className="text-center p-5 shadow-sm border-0 bg-light">
                    <Card.Body>
                        <h4 className="text-muted">Nenhum produto pode ser fabricado</h4>
                        <p className="text-muted">
                            O estoque atual de matérias-primas é insuficiente para produzir qualquer produto cadastrado.
                        </p>
                        <Alert variant="warning" className="d-inline-block text-start mb-0">
                            💡 <strong>Dica:</strong> Acesse a aba <strong>Matérias-Primas</strong> e reabasteça o estoque de insumos.
                        </Alert>
                    </Card.Body>
                </Card>
            ) : (
                <Card className="shadow-sm border-0">
                    <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center py-3">
                        <span className="fw-bold">Sugestão de Fabricação</span>
                        <span>
                            Capacidade Total: <Badge bg="warning" text="dark" className="fs-6">{totalUnitsAll} unidades</Badge>
                        </span>
                    </Card.Header>
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Produto</th>
                                <th className="text-center" style={{ width: "200px" }}>Qtd. Sugerida</th>
                                <th className="text-end" style={{ width: "220px" }}>Valor Total Estimado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plan.map((item, index) => (
                                <tr key={index}>
                                    <td className="fw-bold fs-6">
                                        {item.productName}
                                    </td>
                                    <td className="text-center">
                                        <Badge
                                            bg="success"
                                            className="px-3 py-2 fs-6"
                                        >
                                            {item.quantity} un
                                        </Badge>
                                    </td>
                                    <td className="text-end fw-semibold fs-6">
                                        R${" "}
                                        {item.totalValue.toLocaleString(
                                            "pt-BR",
                                            { minimumFractionDigits: 2 }
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="table-active fw-bold fs-5">
                                <td colSpan={2} className="py-3">
                                    💰 Faturamento Total Estimado da Produção
                                </td>
                                <td className="text-end text-success py-3">
                                    R${" "}
                                    {totalValueAll.toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                    })}
                                </td>
                            </tr>
                        </tfoot>
                    </Table>
                </Card>
            )}

            <ConfirmModal
                show={showConfirmModal}
                title="⚡ Efetivar Ordem de Produção"
                message={`Deseja efetivar a fabricação de ${totalUnitsAll} produtos no valor total de R$ ${totalValueAll.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}? As matérias-primas consumidas serão deduzidas imediatamente do estoque físico.`}
                confirmText="Efetivar e Baixar Estoque"
                variant="success"
                isLoading={executing}
                onConfirm={handleExecuteProduction}
                onCancel={() => setShowConfirmModal(false)}
            />
        </Container>
    );
}
