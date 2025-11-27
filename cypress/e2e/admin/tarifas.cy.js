describe('Gestión de Tarifas - Usuario Admin', () => {

  beforeEach(() => {
    const USUARIO = 'admin';
    const PASSWORD = 'admin123'; 

    cy.loginAdmin(USUARIO, PASSWORD);
    cy.intercept('PUT', '/api/tarifas').as('apiGuardarTarifa');
  });


  it('Debe registrar una nueva tarifa de Carro correctamente', () => {
    cy.contains('a', 'Tarifas').click(); 
    cy.url().should('include', '/tarifas');
  
    // Selects
    cy.contains('label', 'Tipo de vehículo').parent().find('select').select('Carro', { force: true });
    cy.contains('label', 'Modo de cobro').parent().find('select').select('Mixto', { force: true });

    // Inputs
    cy.contains('label', 'Valor minuto').parent().find('input').clear().type('120');                      
    cy.contains('label', 'Valor hora').parent().find('input').clear().type('6000');
    cy.contains('label', 'Valor día').parent().find('input').clear().type('30000');

    // Guardar
    cy.get('button[type="submit"]').contains('Guardar').click();

    // Verificación
    cy.wait('@apiGuardarTarifa').its('response.statusCode').should('eq', 200);
    cy.contains(/Tarifa (guardada|actualizada)/i).should('be.visible'); 
  });

  it('Debe de lanzar un mensaje cuando el campo de minutos está vacío', () => {
    
    cy.contains('a', 'Tarifas').click(); 
    
    cy.contains('label', 'Tipo de vehículo').parent().find('select').select('Carro', { force: true });
    cy.contains('label', 'Modo de cobro').parent().find('select').select('Mixto', { force: true });

    cy.contains('label', 'Valor minuto') 
      .parent()                          
      .find('input')                    
      .clear();                     


    cy.contains('label', 'Valor hora').parent().find('input').clear().type('6000');
    cy.contains('label', 'Valor día').parent().find('input').clear().type('30000');

    cy.get('button[type="submit"]').contains('Guardar').click();


    cy.contains('label', 'Valor minuto')
      .parent()
      .find('input')
      .then(($input) => {
        expect($input[0].checkValidity()).to.be.false;
      });
  });

});