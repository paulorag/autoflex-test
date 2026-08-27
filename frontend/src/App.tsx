import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardPage } from "./pages/DashboardPage";
import { RawMaterialsPage } from "./pages/RawMaterialsPage";
import { ProductsPage } from "./pages/ProductsPage";
import { PlanningPage } from "./pages/PlanningPage";
import { ProductionOrdersPage } from "./pages/ProductionOrdersPage";

function App() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <BrowserRouter>
            <div className="app-layout">
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
                <div className={`main-wrapper ${sidebarCollapsed ? "expanded" : ""}`}>
                    <Header />
                    <main>
                        <Routes>
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/raw-materials" element={<RawMaterialsPage />} />
                            <Route path="/products" element={<ProductsPage />} />
                            <Route path="/planning" element={<PlanningPage />} />
                            <Route path="/orders" element={<ProductionOrdersPage />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
