import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import type { AuthUser, LoginRequest } from "../types";
import { LoginModal } from "../components/LoginModal";
import { Spinner } from "react-bootstrap";

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
    openLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(authService.getStoredUser());
    const [token, setToken] = useState<string | null>(authService.getStoredToken());
    const [isLoading, setIsLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = authService.getStoredToken();
            const storedUser = authService.getStoredUser();

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(storedUser);
                setIsLoading(false);
                return;
            }

            // Se não há token gravado, executa auto-login como admin para demo transparente
            try {
                const authRes = await authService.login({
                    username: "admin",
                    password: "admin123",
                });
                setToken(authRes.token);
                setUser({
                    id: authRes.id,
                    username: authRes.username,
                    name: authRes.name,
                    role: authRes.role,
                });
            } catch (err) {
                console.warn("Sessão anônima. Necessário login para carregar dados.", err);
                setShowLoginModal(true);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();

        const handleAuthChange = () => {
            setUser(authService.getStoredUser());
            setToken(authService.getStoredToken());
        };

        const handleUnauthorized = () => {
            setUser(null);
            setToken(null);
            setShowLoginModal(true);
        };

        window.addEventListener("autoflex_auth_change", handleAuthChange);
        window.addEventListener("autoflex_unauthorized", handleUnauthorized);

        return () => {
            window.removeEventListener("autoflex_auth_change", handleAuthChange);
            window.removeEventListener("autoflex_unauthorized", handleUnauthorized);
        };
    }, []);

    const login = async (credentials: LoginRequest) => {
        const res = await authService.login(credentials);
        setToken(res.token);
        setUser({
            id: res.id,
            username: res.username,
            name: res.name,
            role: res.role,
        });
        setShowLoginModal(false);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setToken(null);
    };

    const openLoginModal = () => {
        setShowLoginModal(true);
    };

    if (isLoading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
                <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} />
                <h5 className="mt-3 text-dark fw-bold">Autoflex PCP</h5>
                <p className="text-muted small">Inicializando ambiente de produção seguro...</p>
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token && !!user,
                isLoading,
                login,
                logout,
                openLoginModal,
            }}
        >
            {children}
            <LoginModal
                show={showLoginModal}
                onHide={() => setShowLoginModal(false)}
                onSuccess={() => {
                    setUser(authService.getStoredUser());
                    setToken(authService.getStoredToken());
                }}
            />
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    }
    return context;
}
