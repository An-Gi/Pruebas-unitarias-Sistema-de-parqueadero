// cypress/support/commands.js

Cypress.Commands.add('loginAdmin', (usuario, password) => {
  cy.visit('/'); 

  // 1. Campo Usuario (Basado en tu imagen)
  // Buscamos por name="usuario" o el placeholder si el name es difícil
  cy.get('input[name="usuario"]') // Si falla, intenta: cy.get('input[placeholder="Usuario"]')
    .should('be.visible')
    .clear()
    .type(usuario);

  // 2. Campo Contraseña
  cy.get('input[name="password"]') // Si falla, intenta: cy.get('input[type="password"]')
    .should('be.visible')
    .clear()
    .type(password);

  // 3. Botón Iniciar Sesión
  cy.get('button[type="submit"]').click();

  // Validar que entramos
  cy.url().should('not.include', '/login');
});