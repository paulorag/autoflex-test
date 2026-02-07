import { useEffect, useState } from "react";
import { Table, Card, Alert, Badge } from "react-bootstrap";
import api from "../services/api";
import { type ProductionPlan } from "../types";

export function PlanningPage() {
    const [plan, setPlan] = useState<ProductionPlan[]>([]);

    useEffect(() => {
        api.get("/production-planning")
            .then((res) => setPlan(res.data))
            .catch(console.error);
    }, []);

    const totalValueAll = plan.reduce((acc, item) => acc + item.totalValue, 0);

    return (
        <div>
            <h2 className="mb-4">📊 Planejamento de Produção</h2>

            <Alert variant="info">
                Este plano prioriza produtos de <strong>maior valor</strong> com
                base no estoque atual.
            </Alert>

            <Card className="shadow-sm">
                <Card.Body>
                    <Table hover responsive>
                        <thead className="table-light">
                            <tr>
                                <th>Produto</th>
                                <th className="text-center">Qtd. Sugerida</th>
                                <th className="text-end">Valor Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plan.map((item, index) => (
                                <tr key={index}>
                                    <td className="fw-bold">
                                        {item.productName}
                                    </td>
                                    <td className="text-center">
                                        <Badge
                                            bg="success"
                                            style={{ fontSize: "1em" }}
                                        >
                                            {item.quantity} un
                                        </Badge>
                                    </td>
                                    <td className="text-end">
                                        R${" "}
                                        {item.totalValue.toLocaleString(
                                            "pt-BR",
                                            { minimumFractionDigits: 2 },
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="table-active fw-bold">
                                <td colSpan={2}>
                                    Valor Total Estimado da Produção
                                </td>
                                <td className="text-end text-success">
                                    R${" "}
                                    {totalValueAll.toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                    })}
                                </td>
                            </tr>
                        </tfoot>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
}
