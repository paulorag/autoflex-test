import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Boxes,
    Wrench,
    Zap,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
    Factory,
} from "lucide-react";

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    return (
        <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
            <div className="sidebar-header">
                {!collapsed ? (
                    <NavLink to="/" className="sidebar-brand">
                        <div className="sidebar-brand-icon">
                            <Factory size={20} />
                        </div>
                        <div>
                            <div>Autoflex</div>
                            <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 500, letterSpacing: "0.5px" }}>
                                PCP & MRP SYSTEM
                            </span>
                        </div>
                    </NavLink>
                ) : (
                    <div className="sidebar-brand-icon mx-auto">
                        <Factory size={20} />
                    </div>
                )}
                <button
                    className="sidebar-toggle-btn"
                    onClick={onToggle}
                    title={collapsed ? "Expandir Sidebar" : "Recolher Sidebar"}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {!collapsed && <div className="nav-section-title">Principal</div>}
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `sidebar-nav-item ${isActive ? "active" : ""}`
                    }
                    title="Dashboard"
                >
                    <LayoutDashboard size={20} />
                    {!collapsed && <span>Dashboard</span>}
                </NavLink>

                {!collapsed && <div className="nav-section-title">Operações</div>}
                <NavLink
                    to="/raw-materials"
                    className={({ isActive }) =>
                        `sidebar-nav-item ${isActive ? "active" : ""}`
                    }
                    title="Matérias-Primas"
                >
                    <Boxes size={20} />
                    {!collapsed && <span>Matérias-Primas</span>}
                </NavLink>

                <NavLink
                    to="/products"
                    className={({ isActive }) =>
                        `sidebar-nav-item ${isActive ? "active" : ""}`
                    }
                    title="Produtos & Receitas"
                >
                    <Wrench size={20} />
                    {!collapsed && <span>Produtos & Fichas</span>}
                </NavLink>

                {!collapsed && <div className="nav-section-title">Planejamento & PCP</div>}
                <NavLink
                    to="/planning"
                    className={({ isActive }) =>
                        `sidebar-nav-item ${isActive ? "active" : ""}`
                    }
                    title="Planejamento de Produção"
                >
                    <Zap size={20} />
                    {!collapsed && <span>Planejamento PCP</span>}
                </NavLink>

                <NavLink
                    to="/orders"
                    className={({ isActive }) =>
                        `sidebar-nav-item ${isActive ? "active" : ""}`
                    }
                    title="Histórico de Ordens"
                >
                    <ClipboardList size={20} />
                    {!collapsed && <span>Histórico de Ordens</span>}
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                {!collapsed ? (
                    <div className="api-status-badge">
                        <span className="status-dot"></span>
                        <span>Motor PCP Ativo • v1.0</span>
                    </div>
                ) : (
                    <div className="d-flex justify-content-center">
                        <span className="status-dot" title="Motor PCP Ativo"></span>
                    </div>
                )}
            </div>
        </aside>
    );
}
