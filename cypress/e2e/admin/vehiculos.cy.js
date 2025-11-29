describe('Gestión de ingreso de vehículos', () => {
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
    PLACA = ''
    TIPO = 'Moto'
    // ingresamos los datos
    cy.get('#ingPlaca').clear();
    cy.get(`label[for="tipo${TIPO}"]`).click();
    // intentamos registrar el vehículo
    cy.contains('button', 'Ingresar').click();

    // el navegador debe marcar el campo como inválido porque es requerido
    cy.get('#ingPlaca').then($input => {
      expect($input[0].checkValidity()).to.be.false; // valida que el estado del campo actual no es válido
      expect($input[0].validity.valueMissing).to.be.true; // valida que el campo está vacío
    });
    // el comprobante NO debe aparecer
    cy.get('#compIngreso').then($comprobante => {
      const visibilidad = $comprobante.is(':visible'); // true -> visible | false -> no visible
      if (visibilidad) { // si se ingresó el vehículo debemos sacarlo
        AUTO_REGISTRADO = true;
      }
      expect(visibilidad).to.be.false;
    });
  });

  it('Caso 53: Validar el manejo de ingresos sin tipo de vehículo', () => {
    // definimos los datos a usar
    PLACA = 'XYZ-789'
    TIPO = ''
    // ingresamos los datos
    cy.get('#ingPlaca').clear().type(PLACA);
    // intentamos registrar el vehículo
    cy.contains('button', 'Ingresar').click();

    // el navegador debe devolver un mensaje indicando que el tipo de vehículo es obligatorio
    cy.on('window:alert', (alerta) => {
      expect(alerta).to.contain('Placa y tipo son obligatorios');
    });
    // el comprobante NO debe aparecer
    cy.get('#compIngreso').then($comprobante => {
      const visibilidad = $comprobante.is(':visible'); // true -> visible | false -> no visible
      if (visibilidad) { // si se ingresó el vehículo debemos sacarlo
        AUTO_REGISTRADO = true;
      }
      expect(visibilidad).to.be.false;
    });
  });

  it('Caso 54: Validar el intento de registrar el ingreso de un vehículo que ya se encuentra adentro', () => {
    // definimos los datos a usar
    PLACA = 'AJS-456'
    TIPO = 'Bici'
    // ingresamos el vehículo por primera vez
    cy.registrarVehiculo(PLACA, TIPO).then(() => {
      AUTO_REGISTRADO = true;
    });

    cy.reload();

    // ingresamos los datos por segunda vez
    cy.get('#ingPlaca').clear().type(PLACA);
    cy.get(`label[for="tipo${TIPO}"]`).click();
    // intentamos registrar el vehículo nuevamente
    cy.contains('button', 'Ingresar').click();

    // el navegador debe devolver un mensaje indicando que el vehículo ya está registrado
    cy.on('window:alert', (alerta) => {
      expect(alerta).to.contain('El vehículo ya está dentro');
    });
    // el comprobante NO debe aparecer
    cy.get('#compIngreso').then($comprobante => {
      const visibilidad = $comprobante.is(':visible'); // true -> visible | false -> no visible
      if (visibilidad) { // si se ingresó el vehículo debemos sacarlo
        AUTO_REGISTRADO = true;
      }
      expect(visibilidad).to.be.false;
    });
  });

  it('Caso 55: Validar el ingreso de un vehículo con placa inválida (longitud < 7)', () => {
    // definimos los datos a usar
    PLACA = 'CTR-12'
    TIPO = 'Carro'
    // ingresamos los datos
    cy.get('#ingPlaca').clear().type(PLACA);
    cy.get(`label[for="tipo${TIPO}"]`).click();
    // intentamos registrar el vehículo
    cy.contains('button', 'Ingresar').click();

    // el navegador debe devolver un mensaje indicando que la placa ingresada no es válida
    cy.on('window:alert', (alerta) => {
      expect(alerta).to.contain('Placa inválida');
    });
    // el comprobante NO debe aparecer
    cy.get('#compIngreso').then($comprobante => {
      const visibilidad = $comprobante.is(':visible'); // true -> visible | false -> no visible
      if (visibilidad) { // si se ingresó el vehículo debemos sacarlo
        AUTO_REGISTRADO = true;
      }
      expect(visibilidad).to.be.false;
    });
  });

  it('Caso 56: Validar el ingreso de un vehículo con placa inválida (longitud > 7)', () => {
    // definimos los datos a usar
    PLACA = 'CTR-2712'
    TIPO = 'Carro'
    // ingresamos los datos
    cy.get('#ingPlaca').clear().type(PLACA);
    cy.get(`label[for="tipo${TIPO}"]`).click();
    // intentamos registrar el vehículo
    cy.contains('button', 'Ingresar').click();

    // el navegador debe devolver un mensaje indicando que la placa ingresada no es válida
    cy.on('window:alert', (alerta) => {
      expect(alerta).to.contain('Placa inválida');
    });
    // el comprobante NO debe aparecer
    cy.get('#compIngreso').then($comprobante => {
      const visibilidad = $comprobante.is(':visible'); // true -> visible | false -> no visible
      if (visibilidad) { // si se ingresó el vehículo debemos sacarlo
        AUTO_REGISTRADO = true;
      }
      expect(visibilidad).to.be.false;
    });
  });

  it('Caso 57: Validar el ingreso de un vehículo con placa inválida ("-" mal colocado)', () => {
    // definimos los datos a usar
    PLACA = 'CT-R270'
    TIPO = 'Carro'
    // ingresamos los datos
    cy.get('#ingPlaca').clear().type(PLACA);
    cy.get(`label[for="tipo${TIPO}"]`).click();
    // intentamos registrar el vehículo
    cy.contains('button', 'Ingresar').click();

    // el navegador debe devolver un mensaje indicando que la placa ingresada no es válida
    cy.on('window:alert', (alerta) => {
      expect(alerta).to.contain('Placa inválida');
    });
    // el comprobante NO debe aparecer
    cy.get('#compIngreso').then($comprobante => {
      const visibilidad = $comprobante.is(':visible'); // true -> visible | false -> no visible
      if (visibilidad) { // si se ingresó el vehículo debemos sacarlo
        AUTO_REGISTRADO = true;
      }
      expect(visibilidad).to.be.false;
    });
  });

  it('Caso 58: Validar el ingreso de un vehículo con placa inválida (letras en el campo de números)', () => {
    // definimos los datos a usar
    PLACA = 'ABC-1SQ'
    TIPO = 'Carro'
    // ingresamos los datos
    cy.get('#ingPlaca').clear().type(PLACA);
    cy.get(`label[for="tipo${TIPO}"]`).click();
    // intentamos registrar el vehículo
    cy.contains('button', 'Ingresar').click();

    // el navegador debe devolver un mensaje indicando que la placa ingresada no es válida
    cy.on('window:alert', (alerta) => {
      expect(alerta).to.contain('Placa inválida');
    });
    // el comprobante NO debe aparecer
    cy.get('#compIngreso').then($comprobante => {
      const visibilidad = $comprobante.is(':visible'); // true -> visible | false -> no visible
      if (visibilidad) { // si se ingresó el vehículo debemos sacarlo
        AUTO_REGISTRADO = true;
      }
      expect(visibilidad).to.be.false;
    });
  });

  it('Caso 59: Validar el ingreso de un vehículo con placa inválida (números en el campo de letras)', () => {
    // definimos los datos a usar
    PLACA = 'A34-987'
    TIPO = 'Carro'
    // ingresamos los datos
    cy.get('#ingPlaca').clear().type(PLACA);
    cy.get(`label[for="tipo${TIPO}"]`).click();
    // intentamos registrar el vehículo
    cy.contains('button', 'Ingresar').click();

    // el navegador debe devolver un mensaje indicando que la placa ingresada no es válida
    cy.on('window:alert', (alerta) => {
      expect(alerta).to.contain('Placa inválida');
    });
    // el comprobante NO debe aparecer
    cy.get('#compIngreso').then($comprobante => {
      const visibilidad = $comprobante.is(':visible'); // true -> visible | false -> no visible
      if (visibilidad) { // si se ingresó el vehículo debemos sacarlo
        AUTO_REGISTRADO = true;
      }
      expect(visibilidad).to.be.false;
    });
  });

  it('Caso 60: Validar el ingreso de un vehículo con placa inválida (letras minúsculas)', () => {
    // definimos los datos a usar
    PLACA = 'eta-246'
    TIPO = 'Carro'
    // ingresamos los datos
    cy.get('#ingPlaca').clear().type(PLACA);
    cy.get(`label[for="tipo${TIPO}"]`).click();
    // intentamos registrar el vehículo
    cy.contains('button', 'Ingresar').click();

    // el navegador debe devolver un mensaje indicando que la placa ingresada no es válida
    cy.on('window:alert', (alerta) => {
      expect(alerta).to.contain('Placa inválida');
    });
    // el comprobante NO debe aparecer
    cy.get('#compIngreso').then($comprobante => {
      const visibilidad = $comprobante.is(':visible'); // true -> visible | false -> no visible
      if (visibilidad) { // si se ingresó el vehículo debemos sacarlo
        AUTO_REGISTRADO = true;
      }
      expect(visibilidad).to.be.false;
    });
  });

  it('Caso 61: Validar el ingreso de un vehículo con placa inválida (placa con símbolos)', () => {
    // definimos los datos a usar
    PLACA = 'A$F-4#3'
    TIPO = 'Carro'
    // ingresamos los datos
    cy.get('#ingPlaca').clear().type(PLACA);
    cy.get(`label[for="tipo${TIPO}"]`).click();
    // intentamos registrar el vehículo
    cy.contains('button', 'Ingresar').click();

    // el navegador debe devolver un mensaje indicando que la placa ingresada no es válida
    cy.on('window:alert', (alerta) => {
      expect(alerta).to.contain('Placa inválida');
    });
    // el comprobante NO debe aparecer
    cy.get('#compIngreso').then($comprobante => {
      const visibilidad = $comprobante.is(':visible'); // true -> visible | false -> no visible
      if (visibilidad) { // si se ingresó el vehículo debemos sacarlo
        AUTO_REGISTRADO = true;
      }
      expect(visibilidad).to.be.false;
    });
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
