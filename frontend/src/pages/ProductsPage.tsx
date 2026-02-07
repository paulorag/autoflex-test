import { useEffect, useState } from "react"; // Removi o useCallback, não precisa mais
import { Container, Table, Button, Spinner, Alert } from "react-bootstrap";
import api from "../services/api";
import { type Product } from "../types";
import { ProductFormModal } from "../components/ProductFormModal";

export function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const fetchProducts = () => {
        api.get("/products")
            .then((res) => {
                setProducts(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError("Erro ao carregar produtos.");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: number) => {
        if (confirm("Tem certeza que deseja excluir este produto?")) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                console.error("Erro ao deletar:", error);
                alert("Erro ao excluir.");
            }
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setShowModal(true);
    };

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>🛠️ Produtos e Receitas</h2>
                <Button variant="primary" onClick={handleCreate}>
                    + Novo Produto
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" />
                </div>
            ) : (
                <Table bordered hover className="shadow-sm bg-white">
                    <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Produto</th>
                            <th>Valor</th>
                            <th>Composição</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((prod) => (
                            <tr key={prod.id}>
                                <td>{prod.id}</td>
                                <td className="fw-bold">{prod.name}</td>
                                <td className="text-success">
                                    R$ {prod.value.toFixed(2)}
                                </td>
                                <td>
                                    <ul className="mb-0 small ps-3">
                                        {prod.components.map((comp, idx) => (
                                            <li key={idx}>
                                                {comp.quantityRequired}x{" "}
                                                <strong>
                                                    {comp.rawMaterial.name}
                                                </strong>
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td>
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleEdit(prod)}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() =>
                                            prod.id && handleDelete(prod.id)
                                        }
                                    >
                                        Excluir
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {showModal && (
                <ProductFormModal
                    show={showModal}
                    handleClose={() => {
                        setShowModal(false);
                        setEditingProduct(null);
                    }}
                    onSuccess={fetchProducts}
                    editingProduct={editingProduct}
                />
            )}
        </Container>
    );
}
