import { useLocation } from "react-router-dom";
import { Clock } from "lucide-react";

export function Header() {
    const location = useLocation();

    const getPageDetails = () => {
        switch (location.pathname) {
            case "/":
                return {
                    title: "📊 Painel de Controle de Produção (PCP)",
                    description: "Visão 360° da fábrica: estoque de insumos, capacidade produtiva e simulação financeira.",
                };
            case "/raw-materials":
                return {
                    title: "📦 Gestão de Matérias-Primas",
                    description: "Controle de saldo em estoque e suprimento de insumos para as linhas de montagem.",
                };
            case "/products":
                return {
                    title: "🛠️ Catálogo de Produtos e Fichas Técnicas (BOM)",
                    description: "Definição de produtos acabados, valores de venda e receitas de matérias-primas.",
                };
            case "/planning":
                return {
                    title: "⚡ Planejamento de Produção Otimizado",
                    description: "Algoritmo guloso de alocação de insumos priorizando produtos de maior valor comercial.",
                };
            case "/orders":
                return {
                    title: "📜 Histórico e Rastreabilidade de Ordens",
                    description: "Registro de todas as produções executadas no chão de fábrica e baixa de insumos.",
                };
            default:
                return {
                    title: "Autoflex PCP",
                    description: "Sistema Integrado de Gestão de Chão de Fábrica",
                };
        }
    };

    const details = getPageDetails();

    return (
        <header className="top-header">
            <div className="header-title-area">
                <h1>{details.title}</h1>
                <p>{details.description}</p>
            </div>
            <div className="header-actions">
                <div className="d-flex align-items-center gap-2 text-muted small bg-light px-3 py-2 rounded-pill border">
                    <Clock size={15} className="text-primary" />
                    <span>{new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</span>
                </div>
            </div>
        </header>
    );
}
