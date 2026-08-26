import { useEffect, useState, useCallback } from "react";
import { Table, Container, Alert, Spinner, Button, Card, Badge } from "react-bootstrap";
import { rawMaterialService } from "../services/rawMaterialService";
import { type RawMaterial } from "../types";
import { RawMaterialFormModal } from "../components/RawMaterialFormModal";
import { ConfirmModal } from "../components/ConfirmModal";

export function RawMaterialsPage() {
    const [materials, setMaterials] = useState<RawMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [showFormModal, setShowFormModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchMaterials = useCallback(() => {
        setLoading(true);
        rawMaterialService.getAll()
            .then((data) => {
                setMaterials(data);
                setError(null);
            })
            .catch((err) => {
                console.error("Erro ao buscar dados:", err);
                setError("Erro ao carregar matérias-primas do servidor.");
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const handleConfirmDelete = async () => {
        if (!deletingId) return;

        setIsDeleting(true);
        try {
            await rawMaterialService.delete(deletingId);
            setSuccessMessage("Matéria-prima excluída com sucesso!");
            setTimeout(() => setSuccessMessage(null), 4000);
            fetchMaterials();
            setDeletingId(null);
        } catch (err: any) {
            console.error(err);
            const serverMessage = err.response?.data?.message || "Erro ao excluir matéria-prima. Verifique se não está em uso.";
            setError(serverMessage);
            setDeletingId(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (material: RawMaterial) => {
        setEditingMaterial(material);
        setShowFormModal(true);
    };

    const handleCreate = () => {
        setEditingMaterial(null);
        setShowFormModal(true);
    };

    return (
        <Container className="py-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">📦 Estoque de Matérias-Primas</h2>
                    <p className="text-muted mb-0">Gerencie o inventário físico de insumos para a produção.</p>
                </div>
                <Button variant="primary" onClick={handleCreate} className="fw-semibold shadow-sm">
                    + Nova Matéria-Prima
                </Button>
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
                    <p className="mt-2 text-muted">Carregando insumos...</p>
                </div>
            ) : materials.length === 0 ? (
                <Card className="text-center p-5 shadow-sm border-0 bg-light">
                    <Card.Body>
                        <h4 className="text-muted">Nenhuma matéria-prima cadastrada</h4>
                        <p className="text-muted">Cadastre seus primeiros insumos para começar a montar receitas de produtos.</p>
                        <Button variant="primary" onClick={handleCreate}>
                            + Cadastrar Insumo
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <Card className="shadow-sm border-0">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th style={{ width: "80px" }}>ID</th>
                                <th>Insumo / Matéria-Prima</th>
                                <th className="text-center" style={{ width: "200px" }}>Qtd. em Estoque</th>
                                <th className="text-end" style={{ width: "180px" }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materials.map((item) => (
                                <tr key={item.id}>
                                    <td className="text-muted fw-bold">#{item.id}</td>
                                    <td className="fw-semibold">{item.name}</td>
                                    <td className="text-center">
                                        <Badge
                                            bg={item.stockQuantity > 0 ? "success" : "danger"}
                                            className="px-3 py-2 fs-6"
                                        >
                                            {item.stockQuantity} un
                                        </Badge>
                                    </td>
                                    <td className="text-end">
                                        <Button
                                            variant="outline-warning"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleEdit(item)}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => setDeletingId(item.id)}
                                        >
                                            Excluir
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            )}

            {showFormModal && (
                <RawMaterialFormModal
                    show={showFormModal}
                    handleClose={() => {
                        setShowFormModal(false);
                        setEditingMaterial(null);
                    }}
                    onSuccess={() => {
                        setSuccessMessage(editingMaterial ? "Matéria-prima atualizada!" : "Matéria-prima cadastrada!");
                        setTimeout(() => setSuccessMessage(null), 4000);
                        fetchMaterials();
                    }}
                    editingMaterial={editingMaterial}
                />
            )}

            <ConfirmModal
                show={deletingId !== null}
                title="⚠️ Confirmar Exclusão"
                message="Tem certeza que deseja excluir esta matéria-prima? Se ela estiver vinculada a produtos, a exclusão será bloqueada para garantir a integridade das receitas."
                confirmText="Sim, Excluir"
                variant="danger"
                isLoading={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeletingId(null)}
            />
        </Container>
    );
}
