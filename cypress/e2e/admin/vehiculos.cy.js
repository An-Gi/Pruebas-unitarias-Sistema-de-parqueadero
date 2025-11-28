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
    PLACA = ''
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
    // el comprobante NO debe aparecer
    cy.get('#compIngreso').should('not.be.visible');
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
    cy.contains('Placa y tipo son obligatorios').should('be.visible');
    // el comprobante NO debe aparecer
    cy.get('#compIngreso').should('not.be.visible');
  });

  it('Caso 54: Validar el intento de registrar el ingreso de un vehículo que ya se encuentra adentro', () => {
    // definimos los datos a usar
    PLACA = 'AJS-456'
    TIPO = 'Bici'
    // ingresamos los datos por primera vez
    cy.get('#ingPlaca').clear().type(PLACA);
    cy.get(`label[for="tipo${TIPO}"]`).click();
    // registramos el vehículo
    cy.contains('button', 'Ingresar').click();
    // ingresamos los datos por segunda vez
    cy.get('#ingPlaca').clear().type(PLACA);
    cy.get(`label[for="tipo${TIPO}"]`).click();
    // intentamos registrar el vehículo nuevamente
    cy.contains('button', 'Ingresar').click();

    // el navegador debe devolver un mensaje indicando que el vehículo ya está registrado
    cy.contains('El vehículo ya está dentro').should('be.visible');
    cy.contains('OK').click();
    // el comprobante NO debe aparecer
    cy.get('#compIngreso').should('not.be.visible');
  });

  it('Caso 55: Validar el ingreso de un vehículo con placa inválida (longitud < 7)', () => {
    // definimos los datos a usar
    PLACA = 'CTR-12'
    TIPO = 'Carro'
    // ingresamos los datos
    cy.get('#ingPlaca').clear();
    cy.get(`label[for="tipo${TIPO}"]`).click();
    // intentamos registrar el vehículo
    cy.contains('button', 'Ingresar').click();

    // el navegador debe devolver un mensaje NO vacio si ocurre algún error con el campo de la placa
    cy.get('#ingPlaca').then($input => {
      expect($input[0].validationMessage).to.not.eq('');
    });
    // el comprobante NO debe aparecer
    cy.get('#compIngreso').should('not.be.visible');

    // si se ingresó el vehículo debemos sacarlo
    cy.get('#compIngreso').then($comprobante => {
      if ($comprobante.is(':visible')){
        AUTO_REGISTRADO = true;
      }
    });
  });

  it('Caso 56: Validar el ingreso de un vehículo con placa inválida (longitud > 7)', () => {
    // definimos los datos a usar
    PLACA = 'CTR-2712'
    TIPO = 'Carro'
    // ingresamos los datos
    cy.get('#ingPlaca').clear();
    cy.get(`label[for="tipo${TIPO}"]`).click();
    // intentamos registrar el vehículo
    cy.contains('button', 'Ingresar').click();

    // el navegador debe devolver un mensaje NO vacio si ocurre algún error con el campo de la placa
    cy.get('#ingPlaca').then($input => {
      expect($input[0].validationMessage).to.not.eq('');
    });
    // el comprobante NO debe aparecer
    cy.get('#compIngreso').should('not.be.visible');

    // si se ingresó el vehículo debemos sacarlo
    cy.get('#compIngreso').then($comprobante => {
      if ($comprobante.is(':visible')){
        AUTO_REGISTRADO = true;
      }
    });
  });

  it('Caso 57: Validar el ingreso de un vehículo con placa inválida ("-" mal colocado)', () => {
    // definimos los datos a usar
    PLACA = 'CT-R2712'
    TIPO = 'Carro'
    // ingresamos los datos
    cy.get('#ingPlaca').clear();
    cy.get(`label[for="tipo${TIPO}"]`).click();
    // intentamos registrar el vehículo
    cy.contains('button', 'Ingresar').click();

    // el navegador debe devolver un mensaje NO vacio si ocurre algún error con el campo de la placa
    cy.get('#ingPlaca').then($input => {
      expect($input[0].validationMessage).to.not.eq('');
    });
    // el comprobante NO debe aparecer
    cy.get('#compIngreso').should('not.be.visible');

    // si se ingresó el vehículo debemos sacarlo
    cy.get('#compIngreso').then($comprobante => {
      if ($comprobante.is(':visible')){
        AUTO_REGISTRADO = true;
      }
    });
  });

  it('Caso 58: Validar el ingreso de un vehículo con placa inválida (letras en el campo de números)', () => {
    // definimos los datos a usar
    PLACA = 'ABC-1SQ'
    TIPO = 'Carro'
    // ingresamos los datos
    cy.get('#ingPlaca').clear();
    cy.get(`label[for="tipo${TIPO}"]`).click();
    // intentamos registrar el vehículo
    cy.contains('button', 'Ingresar').click();

    // el navegador debe devolver un mensaje NO vacio si ocurre algún error con el campo de la placa
    cy.get('#ingPlaca').then($input => {
      expect($input[0].validationMessage).to.not.eq('');
    });
    // el comprobante NO debe aparecer
    cy.get('#compIngreso').should('not.be.visible');

    // si se ingresó el vehículo debemos sacarlo
    cy.get('#compIngreso').then($comprobante => {
      if ($comprobante.is(':visible')){
        AUTO_REGISTRADO = true;
      }
    });
  });

  it('Caso 59: Validar el ingreso de un vehículo con placa inválida (números en el campo de letras)', () => {
    // definimos los datos a usar
    PLACA = 'A34-987'
    TIPO = 'Carro'
    // ingresamos los datos
    cy.get('#ingPlaca').clear();
    cy.get(`label[for="tipo${TIPO}"]`).click();
    // intentamos registrar el vehículo
    cy.contains('button', 'Ingresar').click();

    // el navegador debe devolver un mensaje NO vacio si ocurre algún error con el campo de la placa
    cy.get('#ingPlaca').then($input => {
      expect($input[0].validationMessage).to.not.eq('');
    });
    // el comprobante NO debe aparecer
    cy.get('#compIngreso').should('not.be.visible');

    // si se ingresó el vehículo debemos sacarlo
    cy.get('#compIngreso').then($comprobante => {
      if ($comprobante.is(':visible')){
        AUTO_REGISTRADO = true;
      }
    });
  });

  it('Caso 60: Validar el ingreso de un vehículo con placa inválida (letras minúsculas)', () => {
    // definimos los datos a usar
    PLACA = 'eta-246'
    TIPO = 'Carro'
    // ingresamos los datos
    cy.get('#ingPlaca').clear();
    cy.get(`label[for="tipo${TIPO}"]`).click();
    // intentamos registrar el vehículo
    cy.contains('button', 'Ingresar').click();

    // el navegador debe devolver un mensaje NO vacio si ocurre algún error con el campo de la placa
    cy.get('#ingPlaca').then($input => {
      expect($input[0].validationMessage).to.not.eq('');
    });
    // el comprobante NO debe aparecer
    cy.get('#compIngreso').should('not.be.visible');

    // si se ingresó el vehículo debemos sacarlo
    cy.get('#compIngreso').then($comprobante => {
      if ($comprobante.is(':visible')){
        AUTO_REGISTRADO = true;
      }
    });
  });

  it('Caso 61: Validar el ingreso de un vehículo con placa inválida (placa con símbolos)', () => {
    // definimos los datos a usar
    PLACA = 'A$F-4#3'
    TIPO = 'Carro'
    // ingresamos los datos
    cy.get('#ingPlaca').clear();
    cy.get(`label[for="tipo${TIPO}"]`).click();
    // intentamos registrar el vehículo
    cy.contains('button', 'Ingresar').click();

    // el navegador debe devolver un mensaje NO vacio si ocurre algún error con el campo de la placa
    cy.get('#ingPlaca').then($input => {
      expect($input[0].validationMessage).to.not.eq('');
    });
    // el comprobante NO debe aparecer
    cy.get('#compIngreso').should('not.be.visible');

    // si se ingresó el vehículo debemos sacarlo
    cy.get('#compIngreso').then($comprobante => {
      if ($comprobante.is(':visible')){
        AUTO_REGISTRADO = true;
      }
    });
  });

  it('Caso 62: Validar que el registro de salida y cobro de un vehículo con datos válidos funcione correctamente', () => {
    // definimos los datos a usar
    PLACA = 'MOT-159'
    TIPO = 'Moto'
    MONTO = 100000;
    // registrar el vehículo para poder sacarlo después
    cy.registrarVehiculo(PLACA, TIPO);
    // ingresamos los datos
    cy.get('#salPlaca').clear().type(PLACA);
    // intentamos registrar la salida del vehículo
    cy.contains('button', 'Finalizar').click();

    // falta elegir el método

    // agregamos el monto a pagar
    cy.get('input.monto').clear().type(MONTO);
    // confirmamos el pago
    cy.get('#btnConfirmPagos').should('be.visible').click();

    // falta cerrar todo y comprobar la factura
  });

  it('Caso 63: Validar el manejo de cobro sin placa', () => {
    // definimos los datos a usar
    PLACA = ''
    TIPO = ''
    MONTO = 0;
    // ingresamos los datos
    cy.get('#salPlaca').clear();
    // intentamos registrar la salida del vehículo
    cy.contains('button', 'Finalizar').click();

    // el navegador debe devolver un mensaje NO vacio si ocurre algún error con el campo de la placa
    cy.get('#salPlaca').then($input => {
      expect($input[0].validationMessage).to.not.eq('');
    });

    // falta cerrar todo y comprobar que NO se hizo la factura
  });

  it('Caso 64: Validar el manejo de cobro con placa inválida (longitud < 7)', () => {
    // definimos los datos a usar
    PLACA = 'CTR-12'
    TIPO = ''
    MONTO = 0;
    // ingresamos los datos
    cy.get('#salPlaca').clear().type(PLACA);
    // intentamos registrar la salida del vehículo
    cy.contains('button', 'Finalizar').click();

    // el navegador debe devolver un mensaje NO vacio si ocurre algún error con el campo de la placa
    cy.get('#salPlaca').then($input => {
      expect($input[0].validationMessage).to.not.eq('');
    });

    // falta cerrar todo y comprobar que NO se hizo la factura
  });

  it('Caso 65: Validar el manejo de cobro con placa inválida (longitud > 7)', () => {
    // definimos los datos a usar
    PLACA = 'CTR-2712'
    TIPO = ''
    MONTO = 0;
    // ingresamos los datos
    cy.get('#salPlaca').clear().type(PLACA);
    // intentamos registrar la salida del vehículo
    cy.contains('button', 'Finalizar').click();

    // el navegador debe devolver un mensaje NO vacio si ocurre algún error con el campo de la placa
    cy.get('#salPlaca').then($input => {
      expect($input[0].validationMessage).to.not.eq('');
    });

    // falta cerrar todo y comprobar que NO se hizo la factura
  });
  //
  //
  //
  it('Caso 66: Validar el manejo de cobro con placa inválida ("-" mal colocado)', () => {
    // definimos los datos a usar
    PLACA = 'CT-R270'
    TIPO = ''
    MONTO = 0;
    // ingresamos los datos
    cy.get('#salPlaca').clear().type(PLACA);
    // intentamos registrar la salida del vehículo
    cy.contains('button', 'Finalizar').click();

    // el navegador debe devolver un mensaje NO vacio si ocurre algún error con el campo de la placa
    cy.get('#salPlaca').then($input => {
      expect($input[0].validationMessage).to.not.eq('');
    });

    // falta cerrar todo y comprobar que NO se hizo la factura
  });

  it('Caso 67: Validar el manejo de cobro con placa inválida (letras en el campo de números)', () => {
    // definimos los datos a usar
    PLACA = 'ABC-1SQ'
    TIPO = ''
    MONTO = 0;
    // ingresamos los datos
    cy.get('#salPlaca').clear().type(PLACA);
    // intentamos registrar la salida del vehículo
    cy.contains('button', 'Finalizar').click();

    // el navegador debe devolver un mensaje NO vacio si ocurre algún error con el campo de la placa
    cy.get('#salPlaca').then($input => {
      expect($input[0].validationMessage).to.not.eq('');
    });

    // falta cerrar todo y comprobar que NO se hizo la factura
  });

  it('Caso 68: Validar el manejo de cobro con placa inválida (números en el campo de letras)', () => {
    // definimos los datos a usar
    PLACA = 'A34-987'
    TIPO = ''
    MONTO = 0;
    // ingresamos los datos
    cy.get('#salPlaca').clear().type(PLACA);
    // intentamos registrar la salida del vehículo
    cy.contains('button', 'Finalizar').click();

    // el navegador debe devolver un mensaje NO vacio si ocurre algún error con el campo de la placa
    cy.get('#salPlaca').then($input => {
      expect($input[0].validationMessage).to.not.eq('');
    });

    // falta cerrar todo y comprobar que NO se hizo la factura
  });

  it('Caso 69: Validar el manejo de cobro con placa inválida (letras minúsculas)', () => {
    // definimos los datos a usar
    PLACA = ' eta-246'
    TIPO = ''
    MONTO = 0;
    // ingresamos los datos
    cy.get('#salPlaca').clear().type(PLACA);
    // intentamos registrar la salida del vehículo
    cy.contains('button', 'Finalizar').click();

    // el navegador debe devolver un mensaje NO vacio si ocurre algún error con el campo de la placa
    cy.get('#salPlaca').then($input => {
      expect($input[0].validationMessage).to.not.eq('');
    });

    // falta cerrar todo y comprobar que NO se hizo la factura
  });

  it('Caso 70: Validar el manejo de cobro con placa inválida (placa con símbolos)', () => {
    // definimos los datos a usar
    PLACA = 'A$F-4#3'
    TIPO = ''
    MONTO = 0;
    // ingresamos los datos
    cy.get('#salPlaca').clear().type(PLACA);
    // intentamos registrar la salida del vehículo
    cy.contains('button', 'Finalizar').click();

    // el navegador debe devolver un mensaje NO vacio si ocurre algún error con el campo de la placa
    cy.get('#salPlaca').then($input => {
      expect($input[0].validationMessage).to.not.eq('');
    });

    // falta cerrar todo y comprobar que NO se hizo la factura
  });
});
