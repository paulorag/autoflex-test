describe("Gestão de Produtos", () => {
    beforeEach(() => {
        cy.visit("http://localhost:5173");
    });

    it("Deve criar um novo produto com receita completa", () => {
        // --- CORREÇÃO AQUI ---
        // 1. Navegar para a tela de Produtos
        // O cy.contains procura o texto "Produtos" (que deve estar no seu menu superior)
        cy.contains("Produtos").click();

        // Opcional: Esperar a tabela carregar para garantir
        // (Verifica se o título da página ou a tabela apareceram)
        cy.contains("Produtos e Receitas").should("be.visible");
        // ---------------------

        // 2. Agora sim, clica no botão
        cy.contains("+ Novo Produto").click();

        // ... o resto do código continua igual ...
        cy.get('input[type="text"]')
            .first()
            .should("be.visible")
            .type("Mesa de Teste Automatizado");
        cy.get('input[type="number"]').first().type("450.50");

        cy.contains("+ Adicionar Ingrediente").click();

        cy.get("select").first().select(1);
        cy.get('input[type="number"]').last().type("4");

        cy.contains("button", "Criar Produto").click();

        cy.get(".modal-dialog").should("not.exist");
        cy.contains("Mesa de Teste Automatizado").should("be.visible");
        cy.contains("R$ 450.50").should("be.visible");
        cy.contains("4x").should("be.visible");
    });
});
