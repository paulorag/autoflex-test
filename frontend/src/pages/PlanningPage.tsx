import { useEffect, useState, useCallback } from "react";
import { Table, Button, Spinner, Row, Col, Alert } from "react-bootstrap";
import { Zap, RefreshCw, AlertTriangle, CheckCircle2, DollarSign, Package, Award } from "lucide-react";
import { planningService } from "../services/planningService";
import type { ProductionPlan } from "../types";
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
                setError("Erro ao calcular planejamento de produção no servidor.");
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
                `⚡ Ordem de Produção #${order.id} executada com sucesso! ${order.totalItems} unidades foram fabricadas e o estoque físico de matérias-primas foi baixado.`
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
    const avgPerUnit = totalUnitsAll > 0 ? totalValueAll / totalUnitsAll : 0;

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

            {/* Quick Metrics Cockpit */}
            <Row className="g-4 mb-4">
                <Col md={4}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box green">
                            <DollarSign size={26} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Faturamento Total Projetado</div>
                            <div className="kpi-value text-success">
                                R$ {totalValueAll.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
                            <div className="kpi-label">Volume Total de Fabricação</div>
                            <div className="kpi-value">{totalUnitsAll} unidades</div>
                        </div>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box amber">
                            <Award size={26} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Receita Média por Item</div>
                            <div className="kpi-value text-warning">
                                R$ {avgPerUnit.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Main Planning Card */}
            <div className="custom-card">
                <div className="custom-card-header flex-wrap gap-3">
                    <div>
                        <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                            <Zap size={20} className="text-warning" />
                            Plano de Produção Otimizado
                        </h5>
                        <small className="text-muted">
                            Alocação gulosa maximizando receita a partir do estoque físico disponível
                        </small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <Button
                            variant="outline-secondary"
                            className="btn-sm d-flex align-items-center gap-1"
                            onClick={fetchPlan}
                            disabled={loading || executing}
                        >
                            <RefreshCw size={15} /> Recalcular Simulação
                        </Button>
                        <Button
                            className="btn-modern-success btn-sm"
                            disabled={loading || executing || plan.length === 0}
                            onClick={() => setShowConfirmModal(true)}
                        >
                            <Zap size={16} /> ⚡ Efetivar Produção & Baixar Estoque
                        </Button>
                    </div>
                </div>

                <div className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Calculando melhor combinação de fabricação...</p>
                        </div>
                    ) : plan.length === 0 ? (
                        <div className="text-center p-5 text-muted">
                            <AlertTriangle size={42} className="text-warning mb-2 opacity-75" />
                            <h5>Nenhum produto pode ser fabricado no momento</h5>
                            <p className="small mb-3">
                                O estoque de matérias-primas não é suficiente para produzir uma unidade sequer dos produtos cadastrados.
                            </p>
                        </div>
                    ) : (
                        <Table responsive className="modern-table mb-0">
                            <thead>
                                <tr>
                                    <th style={{ width: "80px" }}>Prioridade</th>
                                    <th>Produto Acabado</th>
                                    <th className="text-center" style={{ width: "200px" }}>Qtd. Sugerida</th>
                                    <th className="text-end" style={{ width: "240px" }}>Faturamento Total Estimado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {plan.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <span className="badge-pill-custom badge-indigo-soft fw-bold">
                                                #{index + 1}
                                            </span>
                                        </td>
                                        <td className="fw-bold fs-6">
                                            {item.productName}
                                        </td>
                                        <td className="text-center">
                                            <span className="badge-pill-custom badge-success-soft fs-6">
                                                {item.quantity} unidades
                                            </span>
                                        </td>
                                        <td className="text-end fw-bold text-success fs-6">
                                            R$ {item.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ backgroundColor: "#f8fafc" }}>
                                    <td colSpan={3} className="py-3 px-4 fw-bold fs-6">
                                        💰 Total Geral de Faturamento Estimado da Fábrica:
                                    </td>
                                    <td className="text-end py-3 px-4 fw-bold text-success fs-5">
                                        R$ {totalValueAll.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            </tfoot>
                        </Table>
                    )}
                </div>
            </div>

            <ConfirmModal
                show={showConfirmModal}
                title="⚡ Confirmar Efetivação de Ordem de Produção"
                message={`Deseja confirmar a ordem de fabricação para ${totalUnitsAll} produtos no valor total de R$ ${totalValueAll.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}? As matérias-primas consumidas serão debitadas do inventário imediatamente.`}
                confirmText="Efetivar e Deduzir Estoque"
                variant="success"
                isLoading={executing}
                onConfirm={handleExecuteProduction}
                onCancel={() => setShowConfirmModal(false)}
            />
        </div>
    );
}
