import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { rawMaterialService } from "../services/rawMaterialService";
import { type RawMaterial } from "../types";

interface RawMaterialFormModalProps {
    show: boolean;
    handleClose: () => void;
    onSuccess: () => void;
    editingMaterial: RawMaterial | null;
}

export function RawMaterialFormModal({
    show,
    handleClose,
    onSuccess,
    editingMaterial,
}: RawMaterialFormModalProps) {
    const [name, setName] = useState("");
    const [stockQuantity, setStockQuantity] = useState<number | string>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (show) {
            setName(editingMaterial?.name || "");
            setStockQuantity(editingMaterial?.stockQuantity ?? 0);
            setError(null);
        }
    }, [show, editingMaterial]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("O nome da matéria-prima é obrigatório.");
            return;
        }

        const qty = Number(stockQuantity);
        if (isNaN(qty) || qty < 0) {
            setError("A quantidade em estoque deve ser um número maior ou igual a zero.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            if (editingMaterial) {
                await rawMaterialService.update(editingMaterial.id, {
                    name: name.trim(),
                    stockQuantity: qty,
                });
            } else {
                await rawMaterialService.create({
                    name: name.trim(),
                    stockQuantity: qty,
                });
            }

            onSuccess();
            handleClose();
        } catch (err: any) {
            console.error("Erro ao salvar matéria-prima:", err);
            const serverMessage = err.response?.data?.message || err.response?.data?.fieldErrors?.name || "Erro ao salvar matéria-prima.";
            setError(serverMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {editingMaterial ? "✏️ Editar Matéria-Prima" : "📦 Nova Matéria-Prima"}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
                    
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Nome da Matéria-Prima</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ex: Madeira Maciça, Parafuso..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                            disabled={isSubmitting}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Quantidade Inicial em Estoque</Form.Label>
                        <Form.Control
                            type="number"
                            min="0"
                            value={stockQuantity}
                            onChange={(e) => setStockQuantity(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button variant="success" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Salvando...
                            </>
                        ) : editingMaterial ? (
                            "Salvar Alterações"
                        ) : (
                            "Cadastrar"
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
