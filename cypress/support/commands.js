Cypress.Commands.add('loginAdmin', (usuario, password) => {
  cy.visit('/'); 

  cy.get('input[name="usuario"]') 
    .should('be.visible')
    .clear()
    .type(usuario);


  cy.get('input[name="password"]') 
    .should('be.visible')
    .clear()
    .type(password);


  cy.get('button[type="submit"]').click();


  cy.url().should('not.include', '/login');
});