import { useEffect, useState, useCallback } from "react";
import { Table, Button, Spinner, Alert, Row, Col, Form } from "react-bootstrap";
import { Plus, Search, Pencil, Trash2, Wrench, AlertTriangle, CheckCircle2, DollarSign, Layers } from "lucide-react";
import { productService } from "../services/productService";
import type { Product } from "../types";
import { ProductFormModal } from "../components/ProductFormModal";
import { ConfirmModal } from "../components/ConfirmModal";

export function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchProducts = useCallback(() => {
        setLoading(true);
        productService.getAll()
            .then((data) => {
                setProducts(data);
                setError(null);
            })
            .catch((err) => {
                console.error("Erro ao carregar produtos:", err);
                setError("Erro ao carregar produtos do servidor.");
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

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

    const highestPriceProduct = products.length > 0
        ? [...products].sort((a, b) => b.value - a.value)[0]
        : null;

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
                        <div className="kpi-icon-box indigo">
                            <Wrench size={24} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Produtos Cadastrados</div>
                            <div className="kpi-value">{products.length} itens</div>
                        </div>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box green">
                            <DollarSign size={24} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Ticket Médio de Venda</div>
                            <div className="kpi-value text-success">
                                R$ {averagePrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="kpi-card">
                        <div className="kpi-icon-box blue">
                            <Layers size={24} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Maior Margem Unitária</div>
                            <div className="kpi-value fs-5">
                                {highestPriceProduct ? `${highestPriceProduct.name} (R$ ${highestPriceProduct.value.toFixed(2)})` : "—"}
                            </div>
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
                            placeholder="Buscar produto por nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        className="btn-modern-primary"
                        onClick={() => {
                            setEditingProduct(null);
                            setShowModal(true);
                        }}
                    >
                        <Plus size={18} /> Novo Produto & Receita
                    </Button>
                </div>

                <div className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Carregando catálogo e receitas...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center p-5 text-muted">
                            <Wrench size={42} className="text-muted mb-2 opacity-50" />
                            <h5>Nenhum produto cadastrado</h5>
                            <p className="small mb-3">
                                {searchTerm ? "Nenhum produto corresponde aos filtros informados." : "Crie o primeiro produto e monte a receita de insumos necessários para a fabricação."}
                            </p>
                            {!searchTerm && (
                                <Button
                                    className="btn-modern-primary btn-sm"
                                    onClick={() => {
                                        setEditingProduct(null);
                                        setShowModal(true);
                                    }}
                                >
                                    <Plus size={16} /> Criar Primeiro Produto
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Table responsive className="modern-table mb-0">
                            <thead>
                                <tr>
                                    <th style={{ width: "90px" }}>ID</th>
                                    <th>Nome do Produto</th>
                                    <th style={{ width: "170px" }}>Preço de Venda</th>
                                    <th>Ficha Técnica / Receita (BOM)</th>
                                    <th className="text-end" style={{ width: "160px" }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((prod) => (
                                    <tr key={prod.id}>
                                        <td className="text-muted fw-bold">#{prod.id}</td>
                                        <td className="fw-bold fs-6">{prod.name}</td>
                                        <td className="text-success fw-bold fs-6">
                                            R$ {prod.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td>
                                            <div className="d-flex flex-wrap gap-1">
                                                {prod.components.map((comp, idx) => (
                                                    <span key={idx} className="badge-pill-custom badge-slate-soft">
                                                        <strong>{comp.quantityRequired}x</strong> {comp.rawMaterial.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="text-end">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => {
                                                    setEditingProduct(prod);
                                                    setShowModal(true);
                                                }}
                                                title="Editar produto e receita"
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
                        setSuccessMessage(editingProduct ? "Produto e receita atualizados!" : "Produto criado com sucesso!");
                        setTimeout(() => setSuccessMessage(null), 4000);
                        fetchProducts();
                    }}
                    editingProduct={editingProduct}
                />
            )}

            <ConfirmModal
                show={deletingId !== null}
                title="⚠️ Confirmar Exclusão de Produto"
                message="Tem certeza que deseja excluir este produto do catálogo? O cálculo de planejamento não irá mais sugerir este item após a exclusão."
                confirmText="Sim, Excluir"
                variant="danger"
                isLoading={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeletingId(null)}
            />
        </div>
    );
}
