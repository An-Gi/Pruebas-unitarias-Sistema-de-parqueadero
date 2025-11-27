describe('Gestión de ingreso de vehículos', () => {
  
  let PLACA;
  let TIPO;
  let AUTO_REGISTRADO;

  beforeEach(() => {
    PLACA = '';
    TIPO = '';
    AUTO_REGISTRADO = false;

    const USUARIO = 'admin';
    const PASSWORD = 'admin123';
    cy.loginAdmin(USUARIO, PASSWORD); // inicia sesión
    cy.get('#btnAbrirTurno').should('be.visible').click(); // inicia el turno
    cy.contains('a', 'Ingreso / Salida').click(); // ingresa al apartado "Ingreso / Salida"
    cy.get('button[data-bs-dismiss="alert"]').click(); // cerrar mensaje del creador del sistema (esto es opcional)
  });

  afterEach(() => {
    if (AUTO_REGISTRADO) {
      cy.get('#salPlaca').clear().type(PLACA);
      cy.contains('button', 'Finalizar').click();
      cy.get('input.monto').clear().type('1'); // agregar monto mínimo de pago
      cy.get('#btnConfirmPagos').should('be.visible').click(); // remueve el auto de la BD
    }
    cy.contains('a', 'Dashboard').click(); // regresa a la página principal
    cy.get('#turnoQuickBtn').click(); // le da click a cerrar turno
    cy.get('#btnCerrarTurno').should('be.visible').click(); // ciera el turno
  });

  it('Caso 51: Validar que el registro de ingreso de un vehículo con datos válidos funcione correctamente', () => {
    // definimos los datos a usar
    PLACA = 'ABC-123'
    TIPO = 'Carro'
    // ingresamos los datos
    cy.get('#ingPlaca').clear().type(PLACA);
    cy.get(`label[for="tipo${TIPO}"]`).click();
    // intentamos registrar el vehículo
    cy.contains('button', 'Ingresar').click();
    // el comprobante debe aparecer
    cy.get('#compIngreso').should('be.visible').within(() => {
      // título correcto
      cy.contains('h6', 'Comprobante de Ingreso').should('be.visible');
      // validamos placa
      cy.contains('div', 'Placa:').should('contain', PLACA);
      // validamos tipo
      cy.contains('div', 'Tipo:').should('contain', TIPO.toLowerCase());
    }).then(() => { // si todo lo anterior pasó marcamos la flag
      AUTO_REGISTRADO = true;
    });
  });

  it('Caso 52: Validar el manejo de ingreso sin placa', () => {
    // definimos los datos a usar
    TIPO = 'Moto'
    // ingresamos los datos
    cy.get('#ingPlaca').clear();
    cy.get(`label[for="tipo${TIPO}"]`).click();
    // intentamos registrar el vehículo
    cy.contains('button', 'Ingresar').click();
    // el navegador debe devolver un mensaje NO vacio si ocurre algún error con el campo de la placa
    cy.get('#ingPlaca').then($input => {
      expect($input[0].validationMessage).to.not.eq('');
    });
  });
});