describe("Gestão de Produtos", () => {
    beforeEach(() => {
        cy.visit("http://localhost:5173/products");
    });

    it("Deve carregar o catálogo de produtos e abrir o modal de novo produto", () => {
        cy.contains("Catálogo de Produtos e Receitas").should("be.visible");
        cy.contains("+ Novo Produto").click();
        cy.contains("Novo Produto").should("be.visible");
        cy.contains("button", "Cancelar").click();
        cy.get(".modal-dialog").should("not.exist");
    });
});
