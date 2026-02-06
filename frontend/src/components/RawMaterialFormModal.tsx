import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import api from "../services/api";
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
    const [name, setName] = useState(editingMaterial?.name || "");
    const [stockQuantity, setStockQuantity] = useState(
        editingMaterial?.stockQuantity || 0,
    );

    const handleSubmit = async () => {
        try {
            if (editingMaterial) {
                await api.put(`/raw-materials/${editingMaterial.id}`, {
                    name,
                    stockQuantity,
                });
                alert("Atualizado com sucesso!");
            } else {
                await api.post("/raw-materials", {
                    name,
                    stockQuantity,
                });
                alert("Criado com sucesso!");
            }

            onSuccess();
            handleClose();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar.");
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {editingMaterial
                        ? "Editar Matéria-Prima"
                        : "Nova Matéria-Prima"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Quantidade em Estoque</Form.Label>
                        <Form.Control
                            type="number"
                            value={stockQuantity}
                            onChange={(e) =>
                                setStockQuantity(Number(e.target.value))
                            }
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button variant="success" onClick={handleSubmit}>
                    {editingMaterial ? "Salvar Alterações" : "Criar"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
