import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
import { RawMaterialsPage } from "./pages/RawMaterialsPage";
import { ProductsPage } from "./pages/ProductsPage";
import { PlanningPage } from "./pages/PlanningPage";
import { ProductionOrdersPage } from "./pages/ProductionOrdersPage";

function App() {
    return (
        <BrowserRouter>
            <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="fw-bold fs-4">
                        🏭 Autoflex PCP
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto align-items-center gap-2">
                            <Nav.Link as={Link} to="/" className="fw-semibold">
                                📦 Matérias-Primas
                            </Nav.Link>
                            <Nav.Link as={Link} to="/products" className="fw-semibold">
                                🛠️ Produtos & Receitas
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/planning"
                                className="text-warning fw-bold bg-warning bg-opacity-10 px-3 py-1 rounded"
                            >
                                📊 Planejamento
                            </Nav.Link>
                            <Nav.Link as={Link} to="/orders" className="fw-semibold">
                                📜 Histórico de Ordens
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="pb-5">
                <Routes>
                    <Route path="/" element={<RawMaterialsPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/planning" element={<PlanningPage />} />
                    <Route path="/orders" element={<ProductionOrdersPage />} />
                </Routes>
            </Container>
        </BrowserRouter>
    );
}

export default App;
