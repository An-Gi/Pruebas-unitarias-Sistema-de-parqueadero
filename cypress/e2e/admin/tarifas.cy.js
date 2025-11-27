describe('Gestión de Tarifas - Usuario Admin', () => {

  beforeEach(() => {
    // Asegúrate que estos sean los datos REALES con los que entras manualmente
    const USUARIO = 'admin'; // Ajustado según tu imagen anterior
    const PASSWORD = 'admin123'; 

    cy.loginAdmin(USUARIO, PASSWORD);
    cy.intercept('PUT', '/api/tarifas').as('apiGuardarTarifa');
  });

  // PRUEBA 1: CAMINO FELIZ (Todo correcto)
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

  // PRUEBA 2: CAMINO DE ERROR (Campo vacío)
  // CORRECCIÓN 1: Fíjate en la sintaxis it('descripción', () => { ... })
  it('Debe de lanzar un mensaje cuando el campo de minutos está vacío', () => {
    
    cy.contains('a', 'Tarifas').click(); 
    
    // Llenamos datos válidos primero
    cy.contains('label', 'Tipo de vehículo').parent().find('select').select('Carro', { force: true });
    cy.contains('label', 'Modo de cobro').parent().find('select').select('Mixto', { force: true });

    // CORRECCIÓN 2: Para dejar vacío, SOLO usamos .clear()
    // Si usas .type('') Cypress dará error.
    cy.contains('label', 'Valor minuto') 
      .parent()                          
      .find('input')                    
      .clear(); // ¡Listo! El campo queda vacío.                      

    // Llenamos los demás para aislar el error solo en "minutos"
    cy.contains('label', 'Valor hora').parent().find('input').clear().type('6000');
    cy.contains('label', 'Valor día').parent().find('input').clear().type('30000');

    cy.get('button[type="submit"]').contains('Guardar').click();

    // VALIDACIÓN IMPORTANTE:
    // Si el mensaje "Llena este campo" es del navegador (HTML5), cy.contains NO lo verá.
    // Si es un texto rojo en la página, esto funcionará:
    // cy.contains('Llena este campo').should('be.visible');

    // OPCIÓN B: Si es validación nativa del navegador (la burbuja que sale del input)
    // Se verifica así:
    cy.contains('label', 'Valor minuto')
      .parent()
      .find('input')
      .then(($input) => {
        // Verifica que el navegador considere el input inválido
        expect($input[0].checkValidity()).to.be.false;
        // Verifica el mensaje nativo (puede variar según el navegador)
        // expect($input[0].validationMessage).to.exist; 
      });
  });

});