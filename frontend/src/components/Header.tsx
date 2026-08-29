import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Clock, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { Button, Badge } from "react-bootstrap";
import { authService } from "../services/authService";
import type { AuthUser } from "../types";
import { LoginModal } from "./LoginModal";

export function Header() {
    const location = useLocation();
    const [user, setUser] = useState<AuthUser | null>(authService.getStoredUser());
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        const handleAuthChange = () => {
            setUser(authService.getStoredUser());
        };

        window.addEventListener("autoflex_auth_change", handleAuthChange);

        // Se não houver usuário salvo, tenta login automático com admin para testes locais
        if (!authService.getStoredToken()) {
            authService.login({ username: "admin", password: "admin123" })
                .then((res) => setUser({ id: res.id, username: res.username, name: res.name, role: res.role }))
                .catch(() => {});
        }

        return () => {
            window.removeEventListener("autoflex_auth_change", handleAuthChange);
        };
    }, []);

    const handleLogout = () => {
        authService.logout();
        setUser(null);
    };

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
        <>
            <header className="top-header">
                <div className="header-title-area">
                    <h1>{details.title}</h1>
                    <p>{details.description}</p>
                </div>
                <div className="header-actions d-flex align-items-center gap-2">
                    <div className="d-flex align-items-center gap-2 text-muted small bg-light px-3 py-2 rounded-pill border d-none d-md-flex">
                        <Clock size={15} className="text-primary" />
                        <span>{new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</span>
                    </div>

                    {user ? (
                        <div className="d-flex align-items-center gap-2 bg-white px-3 py-1 rounded-pill border shadow-sm">
                            <div className="d-flex align-items-center gap-1.5">
                                <ShieldCheck size={16} className={user.role === "ROLE_ADMIN" ? "text-danger" : "text-primary"} />
                                <span className="small fw-semibold text-dark">{user.name || user.username}</span>
                                <Badge bg={user.role === "ROLE_ADMIN" ? "danger" : "primary"} className="ms-1" style={{ fontSize: "0.68rem" }}>
                                    {user.role === "ROLE_ADMIN" ? "ADMIN" : "OPERADOR"}
                                </Badge>
                            </div>
                            <Button
                                variant="link"
                                size="sm"
                                className="p-0 text-muted hover-danger ms-1"
                                title="Desconectar / Trocar de Usuário"
                                onClick={handleLogout}
                            >
                                <LogOut size={15} />
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="primary"
                            size="sm"
                            className="rounded-pill d-flex align-items-center gap-1.5 px-3 py-1.5"
                            onClick={() => setShowLoginModal(true)}
                        >
                            <LogIn size={15} />
                            <span>Entrar</span>
                        </Button>
                    )}
                </div>
            </header>

            <LoginModal
                show={showLoginModal}
                onHide={() => setShowLoginModal(false)}
                onSuccess={() => setUser(authService.getStoredUser())}
            />
        </>
    );
}
