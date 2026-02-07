import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
import { RawMaterialsPage } from "./pages/RawMaterialsPages.tsx";
import { ProductsPage } from "./pages/ProductsPage.tsx";
import { PlanningPage } from "./pages/PlanningPage.tsx";

function App() {
    return (
        <BrowserRouter>
            <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
                <Container>
                    <Navbar.Brand as={Link} to="/">
                        🏭 Autoflex System
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/">
                                Matérias-Primas
                            </Nav.Link>
                            <Nav.Link as={Link} to="/products">
                                Produtos
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/planning"
                                className="text-warning fw-bold"
                            >
                                Planejamento
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container>
                <Routes>
                    <Route path="/" element={<RawMaterialsPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/planning" element={<PlanningPage />} />
                </Routes>
            </Container>
        </BrowserRouter>
    );
}

export default App;
