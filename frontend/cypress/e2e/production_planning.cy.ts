describe("Planejamento e Execução de Produção", () => {
    beforeEach(() => {
        cy.visit("http://localhost:5173/planning");
    });

    it("Deve exibir a tela de planejamento com sugestão de fabricação e botão de efetivação", () => {
        cy.contains("Planejamento de Produção Otimizado").should("be.visible");
        cy.contains("⚡ Efetivar Produção").should("be.visible");
    });
});
