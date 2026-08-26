describe("Gestão de Matérias-Primas", () => {
    beforeEach(() => {
        cy.visit("http://localhost:5173");
    });

    it("Deve listar matérias-primas e permitir abrir modal de criação", () => {
        cy.contains("Matérias-Primas").should("be.visible");
        cy.contains("+ Nova Matéria-Prima").click();
        cy.contains("Nova Matéria-Prima").should("be.visible");
        cy.get('input[type="text"]').should("be.visible");
        cy.contains("button", "Cancelar").click();
        cy.get(".modal-dialog").should("not.exist");
    });
});
