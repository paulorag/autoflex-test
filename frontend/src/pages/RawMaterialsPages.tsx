import { useEffect, useState, useCallback } from "react";
import { Table, Container, Alert, Spinner, Button } from "react-bootstrap";
import api from "../services/api";
import { type RawMaterial } from "../types";
import { RawMaterialFormModal } from "../components/RawMaterialFormModal";

export function RawMaterialsPage() {
    const [materials, setMaterials] = useState<RawMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(
        null,
    );

    const fetchMaterials = useCallback(() => {
        api.get("/raw-materials")
            .then((response) => {
                setMaterials(response.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erro ao buscar dados:", err);
                setError("Erro ao conectar com o servidor.");
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const handleDelete = async (id: number) => {
        if (confirm("Tem certeza? Isso pode quebrar receitas de produtos!")) {
            try {
                await api.delete(`/raw-materials/${id}`);
                fetchMaterials();
            } catch (error) {
                console.error(error);
                alert("Erro ao excluir. Verifique se não está em uso.");
            }
        }
    };

    const handleEdit = (material: RawMaterial) => {
        setEditingMaterial(material);
        setShowModal(true);
    };

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>📦 Estoque de Matéria-Prima</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    + Nova Matéria-Prima
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center mt-5">
                    <Spinner animation="border" role="status" />
                </div>
            ) : (
                <Table striped bordered hover className="shadow-sm bg-white">
                    <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Qtd. em Estoque</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.name}</td>
                                <td>{item.stockQuantity}</td>
                                <td>
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleEdit(item)}
                                    >
                                        Editar
                                    </Button>

                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() =>
                                            item.id && handleDelete(item.id)
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
                <RawMaterialFormModal
                    show={showModal}
                    handleClose={() => {
                        setShowModal(false);
                        setEditingMaterial(null);
                    }}
                    onSuccess={fetchMaterials}
                    editingMaterial={editingMaterial}
                />
            )}
        </Container>
    );
}
