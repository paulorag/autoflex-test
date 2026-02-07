import { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Table } from "react-bootstrap";
import api from "../services/api";
import { type RawMaterial, type Product } from "../types";

interface FormItem {
    rawMaterialId: string | number;
    quantity: number | string;
}

interface ProductFormModalProps {
    show: boolean;
    handleClose: () => void;
    onSuccess: () => void;
    editingProduct: Product | null;
}

export function ProductFormModal({
    show,
    handleClose,
    onSuccess,
    editingProduct,
}: ProductFormModalProps) {
    const [name, setName] = useState(editingProduct?.name || "");
    const [value, setValue] = useState<number>(editingProduct?.value || 0);

    const initialIngredients =
        editingProduct?.components.map((comp) => ({
            rawMaterialId: comp.rawMaterial.id!,
            quantity: comp.quantityRequired,
        })) || [];

    const [ingredients, setIngredients] =
        useState<FormItem[]>(initialIngredients);
    const [availableMaterials, setAvailableMaterials] = useState<RawMaterial[]>(
        [],
    );

    useEffect(() => {
        api.get("/raw-materials").then((res) =>
            setAvailableMaterials(res.data),
        );
    }, []);

    const addIngredientRow = () => {
        setIngredients([...ingredients, { rawMaterialId: "", quantity: 1 }]);
    };

    const removeIngredientRow = (index: number) => {
        const newList = [...ingredients];
        newList.splice(index, 1);
        setIngredients(newList);
    };

    const updateIngredient = (
        index: number,
        field: keyof FormItem,
        val: string | number,
    ) => {
        const newList = [...ingredients];
        newList[index] = { ...newList[index], [field]: val };
        setIngredients(newList);
    };

    const handleSubmit = async () => {
        if (!name || ingredients.length === 0) {
            alert("Preencha o nome e adicione ingredientes.");
            return;
        }

        const payload = {
            name,
            value,
            components: ingredients.map((ing) => ({
                rawMaterial: { id: Number(ing.rawMaterialId) },
                quantityRequired: Number(ing.quantity),
            })),
        };

        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, payload);
                alert("Produto atualizado!");
            } else {
                await api.post("/products", payload);
                alert("Produto criado!");
            }
            onSuccess();
            handleClose();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar.");
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    {editingProduct ? "Editar Produto" : "Novo Produto"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row className="mb-3">
                        <Col>
                            <Form.Label>Nome do Produto</Form.Label>
                            <Form.Control
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </Col>
                        <Col md={4}>
                            <Form.Label>Preço de Venda (R$)</Form.Label>
                            <Form.Control
                                type="number"
                                value={value}
                                onChange={(e) =>
                                    setValue(Number(e.target.value))
                                }
                            />
                        </Col>
                    </Row>
                    <hr />
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5>Receita (Composição)</h5>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={addIngredientRow}
                        >
                            + Adicionar Ingrediente
                        </Button>
                    </div>
                    <Table size="sm" bordered>
                        <thead>
                            <tr>
                                <th>Matéria-Prima</th>
                                <th style={{ width: "100px" }}>Qtd.</th>
                                <th style={{ width: "50px" }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {ingredients.map((ing, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <Form.Select
                                            value={ing.rawMaterialId}
                                            onChange={(e) =>
                                                updateIngredient(
                                                    idx,
                                                    "rawMaterialId",
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Selecione...
                                            </option>
                                            {availableMaterials.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.name} (Estoque:{" "}
                                                    {m.stockQuantity})
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </td>
                                    <td>
                                        <Form.Control
                                            type="number"
                                            value={ing.quantity}
                                            onChange={(e) =>
                                                updateIngredient(
                                                    idx,
                                                    "quantity",
                                                    e.target.value,
                                                )
                                            }
                                            min="1"
                                        />
                                    </td>
                                    <td>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() =>
                                                removeIngredientRow(idx)
                                            }
                                        >
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button variant="success" onClick={handleSubmit}>
                    {editingProduct ? "Salvar Alterações" : "Criar Produto"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
