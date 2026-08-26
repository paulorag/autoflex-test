import { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Table, Alert, Spinner } from "react-bootstrap";
import { productService } from "../services/productService";
import { rawMaterialService } from "../services/rawMaterialService";
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
    const [name, setName] = useState("");
    const [value, setValue] = useState<number | string>(0);
    const [ingredients, setIngredients] = useState<FormItem[]>([]);
    const [availableMaterials, setAvailableMaterials] = useState<RawMaterial[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (show) {
            rawMaterialService.getAll()
                .then(setAvailableMaterials)
                .catch((err) => console.error("Erro ao carregar matérias-primas:", err));

            if (editingProduct) {
                setName(editingProduct.name);
                setValue(editingProduct.value);
                setIngredients(
                    editingProduct.components.map((comp) => ({
                        rawMaterialId: comp.rawMaterial.id,
                        quantity: comp.quantityRequired,
                    }))
                );
            } else {
                setName("");
                setValue(0);
                setIngredients([{ rawMaterialId: "", quantity: 1 }]);
            }
            setError(null);
        }
    }, [show, editingProduct]);

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
        val: string | number
    ) => {
        const newList = [...ingredients];
        newList[index] = { ...newList[index], [field]: val };
        setIngredients(newList);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("O nome do produto é obrigatório.");
            return;
        }

        const price = Number(value);
        if (isNaN(price) || price <= 0) {
            setError("O preço de venda deve ser um valor maior que zero.");
            return;
        }

        if (ingredients.length === 0) {
            setError("O produto deve conter ao menos um ingrediente na receita.");
            return;
        }

        const selectedIds = new Set<number>();
        for (let i = 0; i < ingredients.length; i++) {
            const item = ingredients[i];
            const matId = Number(item.rawMaterialId);
            const qty = Number(item.quantity);

            if (!item.rawMaterialId || isNaN(matId)) {
                setError(`Selecione a matéria-prima no item ${i + 1}.`);
                return;
            }

            if (selectedIds.has(matId)) {
                setError("Existem matérias-primas duplicadas na receita. Remova ou junte os itens.");
                return;
            }
            selectedIds.add(matId);

            if (isNaN(qty) || qty <= 0) {
                setError(`A quantidade no item ${i + 1} deve ser maior que zero.`);
                return;
            }
        }

        const payload = {
            name: name.trim(),
            value: price,
            components: ingredients.map((ing) => ({
                rawMaterialId: Number(ing.rawMaterialId),
                quantityRequired: Number(ing.quantity),
            })),
        };

        setIsSubmitting(true);
        setError(null);

        try {
            if (editingProduct) {
                await productService.update(editingProduct.id, payload);
            } else {
                await productService.create(payload);
            }
            onSuccess();
            handleClose();
        } catch (err: any) {
            console.error("Erro ao salvar produto:", err);
            const serverMessage =
                err.response?.data?.message ||
                err.response?.data?.fieldErrors?.name ||
                err.response?.data?.fieldErrors?.value ||
                "Erro ao salvar produto.";
            setError(serverMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {editingProduct ? "✏️ Editar Produto e Receita" : "✨ Novo Produto"}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

                    <Row className="mb-3">
                        <Col md={8}>
                            <Form.Label className="fw-semibold">Nome do Produto</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ex: Mesa de Jantar, Cadeira..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                                disabled={isSubmitting}
                            />
                        </Col>
                        <Col md={4}>
                            <Form.Label className="fw-semibold">Preço de Venda (R$)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </Col>
                    </Row>

                    <hr />

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0 fw-bold">📋 Receita (Composição de Matérias-Primas)</h6>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={addIngredientRow}
                            disabled={isSubmitting}
                        >
                            + Adicionar Insumo
                        </Button>
                    </div>

                    <Table size="sm" bordered responsive className="align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Matéria-Prima</th>
                                <th style={{ width: "120px" }}>Qtd. Necessária</th>
                                <th style={{ width: "60px" }} className="text-center">Ações</th>
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
                                                    e.target.value
                                                )
                                            }
                                            disabled={isSubmitting}
                                        >
                                            <option value="">Selecione uma matéria-prima...</option>
                                            {availableMaterials.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.name} (Disponível: {m.stockQuantity} un)
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
                                                    e.target.value
                                                )
                                            }
                                            min="1"
                                            disabled={isSubmitting}
                                        />
                                    </td>
                                    <td className="text-center">
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => removeIngredientRow(idx)}
                                            disabled={isSubmitting || ingredients.length === 1}
                                            title="Remover insumo"
                                        >
                                            ✕
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
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
                        ) : editingProduct ? (
                            "Salvar Alterações"
                        ) : (
                            "Criar Produto"
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
