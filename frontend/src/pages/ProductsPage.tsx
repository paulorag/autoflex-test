import { useEffect, useState, useCallback } from "react";
import { Table, Button, Spinner, Alert, Row, Col, Form, Badge } from "react-bootstrap";
import { Plus, Search, Pencil, Trash2, Wrench, AlertTriangle, CheckCircle2, DollarSign, LogIn, Lock } from "lucide-react";
import { productService } from "../services/productService";
import type { Product } from "../types";
import { ProductFormModal } from "../components/ProductFormModal";
import { ConfirmModal } from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";

export function ProductsPage() {
    const { token, isAuthenticated, user, openLoginModal } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const isAdmin = user?.role === "ROLE_ADMIN";

    const fetchProducts = useCallback(() => {
        if (!token) return;
        setLoading(true);
        productService.getAll()
            .then((data) => {
                setProducts(data);
                setError(null);
            })
            .catch((err) => {
                console.error("Erro ao carregar produtos:", err);
                if (err.response?.status === 401) {
                    setError("Sessão expirada. Por favor, autentique-se novamente.");
                } else {
                    setError("Erro ao carregar produtos do servidor.");
                }
            })
            .finally(() => setLoading(false));
    }, [token]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchProducts();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, fetchProducts]);

    const handleConfirmDelete = async () => {
        if (!deletingId) return;

        setIsDeleting(true);
        try {
            await productService.delete(deletingId);
            setSuccessMessage("Produto excluído do catálogo com sucesso!");
            setTimeout(() => setSuccessMessage(null), 4000);
            fetchProducts();
            setDeletingId(null);
        } catch (err: any) {
            console.error("Erro ao deletar produto:", err);
            const serverMessage = err.response?.data?.message || "Erro ao excluir produto.";
            setError(serverMessage);
            setDeletingId(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const averagePrice = products.length > 0
        ? products.reduce((acc, p) => acc + p.value, 0) / products.length
        : 0;

    if (!isAuthenticated) {
        return (
            <div className="page-container">
                <Alert variant="warning" className="shadow-sm border-0 d-flex align-items-center justify-content-between p-4 mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <AlertTriangle size={28} className="text-warning" />
                        <div>
                            <h5 className="mb-1 fw-bold">Autenticação Necessária</h5>
                            <p className="mb-0 text-muted small">
                                O catálogo de produtos acabados é protegido. Faça login para acessar as receitas e fichas técnicas.
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

            {/* Quick Metrics */}
            <Row className="g-4 mb-4">
                <Col md={6}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box indigo">
                            <Wrench size={28} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Produtos em Catálogo</div>
                            <div className="kpi-value">{products.length}</div>
                            <div className="kpi-subtext">Com fichas técnicas registradas</div>
                        </div>
                    </div>
                </Col>

                <Col md={6}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box green">
                            <DollarSign size={28} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Preço Médio de Tabela</div>
                            <div className="kpi-value text-success">
                                R$ {averagePrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="kpi-subtext">Valor médio de comercialização</div>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Main Product Table & Filter */}
            <div className="custom-card">
                <div className="custom-card-header flex-column flex-md-row gap-3">
                    <div className="position-relative flex-grow-1" style={{ maxWidth: "450px" }}>
                        <Search size={18} className="search-input-icon text-muted position-absolute" style={{ left: "12px", top: "10px" }} />
                        <Form.Control
                            type="text"
                            placeholder="Buscar produto por nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: "38px" }}
                        />
                    </div>
                    {isAdmin ? (
                        <Button
                            className="btn-modern-primary d-flex align-items-center gap-2"
                            onClick={() => {
                                setEditingProduct(null);
                                setShowModal(true);
                            }}
                        >
                            <Plus size={18} /> Novo Produto
                        </Button>
                    ) : (
                        <div className="d-flex align-items-center gap-1.5 text-muted small bg-light px-3 py-2 rounded border" title="Apenas Administradores podem cadastrar produtos">
                            <Lock size={14} />
                            <span>Modo Somente Leitura (Operador)</span>
                        </div>
                    )}
                </div>

                <div className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Carregando catálogo e receitas...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <Wrench size={48} className="text-muted mb-2 opacity-50" />
                            <h6>Nenhum produto cadastrado</h6>
                            <p className="small">Cadastre um produto definindo o valor de venda e sua lista de matérias-primas (BOM).</p>
                        </div>
                    ) : (
                        <Table responsive className="modern-table mb-0">
                            <thead>
                                <tr>
                                    <th style={{ width: "80px" }}>ID</th>
                                    <th>Nome do Produto</th>
                                    <th>Valor de Venda (R$)</th>
                                    <th>Composição da Receita (BOM)</th>
                                    <th className="text-end" style={{ width: "140px" }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((prod) => (
                                    <tr key={prod.id}>
                                        <td className="text-muted fw-bold">#{prod.id}</td>
                                        <td className="fw-bold text-dark">{prod.name}</td>
                                        <td className="text-success fw-bold">
                                            R$ {prod.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td>
                                            <div className="d-flex flex-wrap gap-1">
                                                {prod.components && prod.components.length > 0 ? (
                                                    prod.components.map((comp, compIdx) => (
                                                        <span key={comp.rawMaterial?.id || compIdx} className="badge bg-light text-dark border me-1">
                                                            {comp.rawMaterial?.name || `Insumo #${comp.rawMaterial?.id}`}: <strong>{comp.quantityRequired} un</strong>
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-muted small">Sem insumos vinculados</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-end">
                                            {isAdmin ? (
                                                <>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => {
                                                            setEditingProduct(prod);
                                                            setShowModal(true);
                                                        }}
                                                        title="Editar produto"
                                                    >
                                                        <Pencil size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => setDeletingId(prod.id)}
                                                        title="Excluir produto"
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
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            </div>

            {showModal && (
                <ProductFormModal
                    show={showModal}
                    handleClose={() => {
                        setShowModal(false);
                        setEditingProduct(null);
                    }}
                    onSuccess={() => {
                        setSuccessMessage(editingProduct ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!");
                        setTimeout(() => setSuccessMessage(null), 4000);
                        fetchProducts();
                    }}
                    editingProduct={editingProduct}
                />
            )}

            <ConfirmModal
                show={deletingId !== null}
                title="⚠️ Confirmar Exclusão de Produto"
                message="Tem certeza que deseja excluir este produto do catálogo? O histórico de ordens já executadas será preservado."
                confirmText="Sim, Excluir"
                variant="danger"
                isLoading={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeletingId(null)}
            />
        </div>
    );
}
