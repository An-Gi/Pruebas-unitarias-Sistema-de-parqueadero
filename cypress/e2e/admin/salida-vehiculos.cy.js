describe('Gestión de salida de vehículos', () => {
  let PLACA;
  let TIPO;
  let METODO_PAGO;
  let MONTO;
  let AUTO_REGISTRADO;

  beforeEach(() => {
    PLACA = '';
    TIPO = '';
    METODO_PAGO = '';
    MONTO = 0;
    AUTO_REGISTRADO = false;

    const USUARIO = 'admin';
    const PASSWORD = 'admin123';
    cy.loginAdmin(USUARIO, PASSWORD); // inicia sesión

    cy.get('#turnoBadge').then($turno => {
      const estado = $turno.text().trim();
      if (estado === 'Turno abierto') {
        cy.get('#turnoQuickBtn').click(); // le da click a cerrar turno
        cy.get('#btnCerrarTurno').should('be.visible').click(); // ciera el turno
        cy.reload();
      }
    });

    cy.get('#btnAbrirTurno').should('be.visible').click(); // inicia el turno
    cy.contains('a', 'Ingreso / Salida').click(); // ingresa al apartado "Ingreso / Salida"
    cy.get('button[data-bs-dismiss="alert"]').click(); // cerrar mensaje del creador del sistema (esto es opcional)
  });

  afterEach(() => {
    if (AUTO_REGISTRADO) {
      cy.get('#salPlaca').clear().type(PLACA);
      cy.contains('button', 'Finalizar').click(); // remueve el auto del parqueo
    }
  });

  it('Caso 62: Validar que el registro de salida y cobro de un vehículo con datos válidos funcione correctamente', () => {
    // definimos los datos a usar
    PLACA = 'MOT-159'
    TIPO = 'Moto'
    METODO_PAGO = 'efectivo'
    MONTO = 100000;
    // registrar el vehículo para poder sacarlo después
    cy.registrarVehiculo(PLACA, TIPO);
    // ingresamos los datos
    cy.get('#salPlaca').clear().type(PLACA);
    // seleccionamos el método de pago
    cy.get('#salMetodo').select(METODO_PAGO);
    // intentamos registrar la salida del vehículo
    cy.contains('button', 'Finalizar').click();

    // agregamos el monto a pagar
    cy.get('input.monto').clear().type(MONTO);
    // confirmamos el pago
    cy.get('#btnConfirmPagos').should('be.visible').click();

    // la factura debe aparecer
    cy.get('#compSalida').should('be.visible').within(() => {
      // título correcto
      cy.contains('h6', 'Factura').should('be.visible');
      // validamos placa
      cy.contains('div', 'Placa:').should('contain', PLACA);
      // validamos tipo
      cy.contains('div', 'Tipo:').should('contain', TIPO.toLowerCase());
      // validamos monto cobrado
      cy.contains('strong', 'Pagos').should('be.visible');
    });
  });

  it('Caso 63: Validar el manejo de cobro sin placa', () => {
    // definimos los datos a usar
    PLACA = ''
    TIPO = ''
    METODO_PAGO = 'efectivo'
    MONTO = 0;
    // ingresamos los datos
    cy.get('#salPlaca').clear();
    // seleccionamos el método de pago
    cy.get('#salMetodo').select(METODO_PAGO);
    // intentamos registrar la salida del vehículo
    cy.contains('button', 'Finalizar').click();

    // el navegador debe marcar el campo como inválido porque es requerido
    cy.get('#salPlaca').then($input => {
      expect($input[0].checkValidity()).to.be.false; // valida que el estado del campo actual no es válido
      expect($input[0].validity.valueMissing).to.be.true; // valida que el campo está vacío
    });
  });

  it('Caso 64: Validar el manejo de cobro con placa inválida (longitud < 7)', () => {
    // stub de alerta
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alerta');
    });
    // definimos los datos a usar
    PLACA = 'CTR-12'
    TIPO = ''
    METODO_PAGO = 'efectivo'
    MONTO = 0;
    // ingresamos los datos
    cy.get('#salPlaca').clear().type(PLACA);
    // seleccionamos el método de pago
    cy.get('#salMetodo').select(METODO_PAGO);
    // intentamos registrar la salida del vehículo
    cy.contains('button', 'Finalizar').click();

    // el navegador debe devolver un mensaje indicando que la placa ingresada no es válida
    cy.get('@alerta').should('have.been.calledOnce').and('have.been.calledWithMatch', 'Placa inválida');
  });

  it('Caso 65: Validar el manejo de cobro con placa inválida (longitud > 7)', () => {
    // stub de alerta
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alerta');
    });
    // definimos los datos a usar
    PLACA = 'CTR-2712'
    TIPO = ''
    METODO_PAGO = 'efectivo'
    MONTO = 0;
    // ingresamos los datos
    cy.get('#salPlaca').clear().type(PLACA);
    // seleccionamos el método de pago
    cy.get('#salMetodo').select(METODO_PAGO);
    // intentamos registrar la salida del vehículo
    cy.contains('button', 'Finalizar').click();

    // el navegador debe devolver un mensaje indicando que la placa ingresada no es válida
    cy.get('@alerta').should('have.been.calledOnce').and('have.been.calledWithMatch', 'Placa inválida');
  });
  
  it('Caso 66: Validar el manejo de cobro con placa inválida ("-" mal colocado)', () => {
    // stub de alerta
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alerta');
    });
    // definimos los datos a usar
    PLACA = 'CT-R270'
    TIPO = ''
    METODO_PAGO = 'efectivo'
    MONTO = 0;
    // ingresamos los datos
    cy.get('#salPlaca').clear().type(PLACA);
    // seleccionamos el método de pago
    cy.get('#salMetodo').select(METODO_PAGO);
    // intentamos registrar la salida del vehículo
    cy.contains('button', 'Finalizar').click();

    // el navegador debe devolver un mensaje indicando que la placa ingresada no es válida
    cy.get('@alerta').should('have.been.calledOnce').and('have.been.calledWithMatch', 'Placa inválida');
  });

  it('Caso 67: Validar el manejo de cobro con placa inválida (letras en el campo de números)', () => {
    // stub de alerta
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alerta');
    });
    // definimos los datos a usar
    PLACA = 'ABC-1SQ'
    TIPO = ''
    METODO_PAGO = 'efectivo'
    MONTO = 0;
    // ingresamos los datos
    cy.get('#salPlaca').clear().type(PLACA);
    // seleccionamos el método de pago
    cy.get('#salMetodo').select(METODO_PAGO);
    // intentamos registrar la salida del vehículo
    cy.contains('button', 'Finalizar').click();

    // el navegador debe devolver un mensaje indicando que la placa ingresada no es válida
    cy.get('@alerta').should('have.been.calledOnce').and('have.been.calledWithMatch', 'Placa inválida');
  });

  it('Caso 68: Validar el manejo de cobro con placa inválida (números en el campo de letras)', () => {
    // stub de alerta
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alerta');
    });
    // definimos los datos a usar
    PLACA = 'A34-987'
    TIPO = ''
    METODO_PAGO = 'efectivo'
    MONTO = 0;
    // ingresamos los datos
    cy.get('#salPlaca').clear().type(PLACA);
    // seleccionamos el método de pago
    cy.get('#salMetodo').select(METODO_PAGO);
    // intentamos registrar la salida del vehículo
    cy.contains('button', 'Finalizar').click();

    // el navegador debe devolver un mensaje indicando que la placa ingresada no es válida
    cy.get('@alerta').should('have.been.calledOnce').and('have.been.calledWithMatch', 'Placa inválida');
  });

  it('Caso 69: Validar el manejo de cobro con placa inválida (letras minúsculas)', () => {
    // stub de alerta
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alerta');
    });
    // definimos los datos a usar
    PLACA = ' eta-246'
    TIPO = ''
    METODO_PAGO = 'efectivo'
    MONTO = 0;
    // ingresamos los datos
    cy.get('#salPlaca').clear().type(PLACA);
    // seleccionamos el método de pago
    cy.get('#salMetodo').select(METODO_PAGO);
    // intentamos registrar la salida del vehículo
    cy.contains('button', 'Finalizar').click();

    // el navegador debe devolver un mensaje indicando que la placa ingresada no es válida
    cy.get('@alerta').should('have.been.calledOnce').and('have.been.calledWithMatch', 'Placa inválida');
  });

  it('Caso 70: Validar el manejo de cobro con placa inválida (placa con símbolos)', () => {
    // stub de alerta
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alerta');
    });
    // definimos los datos a usar
    PLACA = 'A$F-4#3'
    TIPO = ''
    METODO_PAGO = 'efectivo'
    MONTO = 0;
    // ingresamos los datos
    cy.get('#salPlaca').clear().type(PLACA);
    // seleccionamos el método de pago
    cy.get('#salMetodo').select(METODO_PAGO);
    // intentamos registrar la salida del vehículo
    cy.contains('button', 'Finalizar').click();

    // el navegador debe devolver un mensaje indicando que la placa ingresada no es válida
    cy.get('@alerta').should('have.been.calledOnce').and('have.been.calledWithMatch', 'Placa inválida');
  });
});
