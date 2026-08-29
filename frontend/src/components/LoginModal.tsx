import { useState } from "react";
import { Modal, Button, Form, Alert, Badge } from "react-bootstrap";
import { LogIn, UserPlus, Shield, User, Lock, Key } from "lucide-react";
import { authService } from "../services/authService";

interface LoginModalProps {
    show: boolean;
    onHide: () => void;
    onSuccess: () => void;
}

export function LoginModal({ show, onHide, onSuccess }: LoginModalProps) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isRegistering) {
                await authService.register({
                    username,
                    password,
                    name,
                });
                // Auto login após cadastro
                await authService.login({ username, password });
            } else {
                await authService.login({ username, password });
            }
            onSuccess();
            onHide();
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                "Falha na autenticação. Verifique os dados inseridos.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = async (user: string, pass: string) => {
        setUsername(user);
        setPassword(pass);
        setError(null);
        setLoading(true);
        try {
            await authService.login({ username: user, password: pass });
            onSuccess();
            onHide();
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro no login rápido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="d-flex align-items-center gap-2 fs-5">
                    <Shield className="text-primary" size={22} />
                    {isRegistering ? "Criar Nova Conta de Operador" : "Autenticação no Sistema"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-3">
                {error && (
                    <Alert variant="danger" className="py-2 small">
                        {error}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    {isRegistering && (
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-semibold">Nome Completo</Form.Label>
                            <div className="input-group">
                                <span className="input-group-text bg-light">
                                    <User size={16} />
                                </span>
                                <Form.Control
                                    type="text"
                                    placeholder="Ex: Carlos Silva"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </Form.Group>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold">Nome de Usuário (Username)</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text bg-light">
                                <User size={16} />
                            </span>
                            <Form.Control
                                type="text"
                                placeholder="Ex: admin ou operador"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold">Senha</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text bg-light">
                                <Lock size={16} />
                            </span>
                            <Form.Control
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </Form.Group>

                    <div className="d-grid gap-2 mt-4">
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? (
                                "Processando..."
                            ) : isRegistering ? (
                                <>
                                    <UserPlus size={16} className="me-1" /> Cadastrar como Operador e Entrar
                                </>
                            ) : (
                                <>
                                    <LogIn size={16} className="me-1" /> Entrar no Sistema
                                </>
                            )}
                        </Button>
                    </div>
                </Form>

                {!isRegistering && (
                    <div className="mt-4 pt-3 border-top">
                        <p className="small text-muted mb-2 fw-semibold">Acesso Rápido de Teste:</p>
                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-dark"
                                size="sm"
                                className="flex-fill d-flex align-items-center justify-content-center gap-1"
                                onClick={() => handleQuickLogin("admin", "admin123")}
                                disabled={loading}
                            >
                                <Key size={14} className="text-warning" />
                                <span>admin <Badge bg="danger" className="ms-1">ADMIN</Badge></span>
                            </Button>
                            <Button
                                variant="outline-dark"
                                size="sm"
                                className="flex-fill d-flex align-items-center justify-content-center gap-1"
                                onClick={() => handleQuickLogin("operador", "operador123")}
                                disabled={loading}
                            >
                                <Key size={14} className="text-info" />
                                <span>operador <Badge bg="primary" className="ms-1">OPERATOR</Badge></span>
                            </Button>
                        </div>
                    </div>
                )}

                <div className="text-center mt-3">
                    <Button
                        variant="link"
                        size="sm"
                        className="text-decoration-none text-muted"
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setError(null);
                        }}
                    >
                        {isRegistering
                            ? "Já tem uma conta? Entrar"
                            : "Não tem conta? Cadastre-se"}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
}
