import { useEffect, useState, useCallback } from "react";
import { Table, Button, Spinner, Row, Col, Alert } from "react-bootstrap";
import { Zap, RefreshCw, AlertTriangle, CheckCircle2, DollarSign, Package, Award, LogIn } from "lucide-react";
import { planningService } from "../services/planningService";
import type { ProductionPlan } from "../types";
import { ConfirmModal } from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";

export function PlanningPage() {
    const { token, isAuthenticated, openLoginModal } = useAuth();
    const [plan, setPlan] = useState<ProductionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchPlan = useCallback(() => {
        if (!token) return;
        setLoading(true);
        planningService.getPlan()
            .then((data) => {
                setPlan(data);
                setError(null);
            })
            .catch((err) => {
                console.error("Erro ao carregar planejamento:", err);
                if (err.response?.status === 401) {
                    setError("Sessão expirada. Por favor, faça login novamente.");
                } else {
                    setError("Erro ao calcular planejamento de produção no servidor.");
                }
            })
            .finally(() => setLoading(false));
    }, [token]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchPlan();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, fetchPlan]);

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

    if (!isAuthenticated) {
        return (
            <div className="page-container">
                <Alert variant="warning" className="shadow-sm border-0 d-flex align-items-center justify-content-between p-4 mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <AlertTriangle size={28} className="text-warning" />
                        <div>
                            <h5 className="mb-1 fw-bold">Autenticação Necessária</h5>
                            <p className="mb-0 text-muted small">
                                O algoritmo de planejamento requer autenticação para simular e alocar o estoque fabril.
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

            {/* Financial & Volume KPIs */}
            <Row className="g-4 mb-4">
                <Col md={4}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box green">
                            <DollarSign size={28} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Faturamento Total Estimado</div>
                            <div className="kpi-value text-success">
                                R$ {totalValueAll.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </div>
                            <div className="kpi-subtext">Maximização gulosa por margem</div>
                        </div>
                    </div>
                </Col>

                <Col md={4}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box blue">
                            <Package size={28} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Volume de Produtos Viáveis</div>
                            <div className="kpi-value">{totalUnitsAll.toLocaleString()} un</div>
                            <div className="kpi-subtext">Fabricáveis com o estoque atual</div>
                        </div>
                    </div>
                </Col>

                <Col md={4}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box indigo">
                            <Award size={28} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Ticket Médio Otimizado</div>
                            <div className="kpi-value">
                                R$ {avgPerUnit.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="kpi-subtext">Preço unitário ponderado</div>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Main Plan Card */}
            <div className="custom-card">
                <div className="custom-card-header flex-column flex-md-row gap-3">
                    <div>
                        <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                            <Zap size={22} className="text-warning" />
                            Grade Sugerida de Fabricação Imediata
                        </h5>
                        <small className="text-muted">
                            Algoritmo guloso de alocação de matérias-primas priorizando itens de maior valor agregado
                        </small>
                    </div>

                    <div className="d-flex gap-2">
                        <Button
                            variant="outline-secondary"
                            className="d-flex align-items-center gap-1 btn-sm"
                            onClick={fetchPlan}
                            disabled={loading || executing}
                        >
                            <RefreshCw size={14} className={loading ? "spin" : ""} /> Recalcular
                        </Button>

                        {plan.length > 0 && (
                            <Button
                                className="btn-modern-success d-flex align-items-center gap-2 btn-sm"
                                onClick={() => setShowConfirmModal(true)}
                                disabled={loading || executing}
                            >
                                <Zap size={16} /> Efetivar Produção em Chão de Fábrica
                            </Button>
                        )}
                    </div>
                </div>

                <div className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Executando algoritmo guloso de otimização de PCP...</p>
                        </div>
                    ) : plan.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <AlertTriangle size={48} className="text-warning mb-3" />
                            <h5>Nenhuma produção viável no momento</h5>
                            <p className="small mb-3" style={{ maxWidth: "480px", margin: "0 auto" }}>
                                O saldo atual de matérias-primas no almoxarifado não é suficiente para produzir uma unidade sequer dos produtos cadastrados.
                            </p>
                        </div>
                    ) : (
                        <Table responsive className="modern-table mb-0">
                            <thead>
                                <tr>
                                    <th>Prioridade</th>
                                    <th>Produto Acabado</th>
                                    <th className="text-center">Quantidade Sugerida</th>
                                    <th className="text-end">Preço Unitário</th>
                                    <th className="text-end">Subtotal Previsto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {plan.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="fw-bold text-muted">#{idx + 1}</td>
                                        <td className="fw-bold text-dark">{item.productName}</td>
                                        <td className="text-center">
                                            <span className="badge-pill-custom badge-success-soft">
                                                {item.quantity} unidades
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            R$ {(item.quantity > 0 ? item.totalValue / item.quantity : 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
            </div>

            <ConfirmModal
                show={showConfirmModal}
                title="⚡ Efetivar Ordem de Produção"
                message={`Deseja confirmar a fabricação de ${totalUnitsAll} produtos no valor total de R$ ${totalValueAll.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}? O sistema irá abater o consumo das matérias-primas e registrar a ordem de produção com histórico e rastreabilidade.`}
                confirmText="Efetivar e Baixar Insumos"
                variant="success"
                isLoading={executing}
                onConfirm={handleExecuteProduction}
                onCancel={() => setShowConfirmModal(false)}
            />
        </div>
    );
}
