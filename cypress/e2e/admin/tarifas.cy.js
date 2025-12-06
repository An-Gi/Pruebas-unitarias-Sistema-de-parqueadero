describe('Gestión de Tarifas', () => {

  /**
   * Configuración Inicial, se ejecuta antes de cada test.
      1. Define credenciales.
      2. Realiza el inicio de sesión como administrador.
      3. Intercepta la llamada a la API de guardar tarifas para poder validarla más tarde.
   */
  beforeEach(() => {
    const USUARIO = 'admin';
    const PASSWORD = 'admin123'; 

    cy.loginAdmin(USUARIO, PASSWORD);
    cy.intercept('PUT', '/api/tarifas').as('apiGuardarTarifa');
  });

  /**
    Limpieza,se ejecuta después de cada test.
    Restaura el rol del usuario en la base de datos para asegurar que el siguiente test comience en un estado limpio.
   */
  afterEach(() => {
    const sqlRestore = "UPDATE usuarios SET rol = 'admin' WHERE usuario_login = 'admin'";
    cy.task('queryDb', sqlRestore);
  });

  /**
   * CASO 26: 
      1. Navega a la vista de tarifas.
      2. Selecciona las opciones.
      3. Rellena los inputs de precios (minuto, hora, día).
      4. Envía el formulario y valida que la API responda con 200 y aparezca el mensaje.
    -Pasa
   */
  it('Caso 26: Debe registrar una nueva tarifa de Carro correctamente', () => {
    // Navegación
    cy.contains('a', 'Tarifas').click(); 
    cy.url().should('include', '/tarifas');
  
    // Selección de parámetros
    cy.contains('label', 'Tipo de vehículo').parent().find('select').select('Carro', { force: true });
    cy.contains('label', 'Modo de cobro').parent().find('select').select('Mixto', { force: true });

    // Ingreso de datos de prueba
    cy.contains('label', 'Valor minuto').parent().find('input').clear().type('120');                      
    cy.contains('label', 'Valor hora').parent().find('input').clear().type('6000');
    cy.contains('label', 'Valor día').parent().find('input').clear().type('30000');

    // Guardar y validar
    cy.get('button[type="submit"]').contains('Guardar').click();
    cy.wait('@apiGuardarTarifa').its('response.statusCode').should('eq', 200);
    cy.contains('Tarifa guardada').should('be.visible'); 
  });

  /**
   * CASO 27: 
    Verifica la validación HTML5 del formulario.
      1. Deja vacío el campo de "Valor minuto".
      2. Intenta guardar.
      3. Verifica que la propiedad "checkValidity()" del input sea falsa (el navegador impide el envío).
    -Pasa
   */
  it('Caso 27: Debe de lanzar un mensaje cuando el campo de minutos está vacío', () => {
    cy.contains('a', 'Tarifas').click(); 
    
    // Configuración del formulario
    cy.contains('label', 'Tipo de vehículo').parent().find('select').select('Carro', { force: true });
    cy.contains('label', 'Modo de cobro').parent().find('select').select('Mixto', { force: true });

    // Se fuerza el campo a vacío
    cy.contains('label', 'Valor minuto').parent().find('input').clear();                     

    // Se llenan los demás
    cy.contains('label', 'Valor hora').parent().find('input').clear().type('6000');
    cy.contains('label', 'Valor día').parent().find('input').clear().type('30000');

    cy.get('button[type="submit"]').contains('Guardar').click();

    // Validación del navegador
    cy.contains('label', 'Valor minuto')
      .parent().find('input')
      .then(($input) => {
        expect($input[0].checkValidity()).to.be.false;
      });
  });
  
  /**
   * CASO 29: 
    Prueba la capacidad de modificar una tarifa existente.
      1. Define un objeto con los nuevos datos.
      2. Sobrescribe los campos existentes con estos datos.
      3. Guarda y verifica que los nuevos valores sean visibles en la interfaz tras la recarga.
  -Pasa
   */
  it('Caso 29: Actualizar tarifa de Carro con nuevos valores', () => {
    const nuevosDatos = {
      minuto: '160',
      hora: '4000',
      dia: '12000'
    };

    cy.contains('a', 'Tarifas').click();
    cy.url().should('include', '/tarifas');

    // Selección inicial
    cy.contains('label', 'Tipo de vehículo').parent().find('select').select('Carro', { force: true });
    cy.contains('label', 'Modo de cobro').parent().find('select').select('Mixto', { force: true });

    // Iteración de llenado de campos con nuevos datos
    cy.contains('label', 'Valor minuto').parent().find('input').clear().type(nuevosDatos.minuto); 
    cy.contains('label', 'Valor hora').parent().find('input').clear().type(nuevosDatos.hora);  
    cy.contains('label', 'Valor día').parent().find('input').clear().type(nuevosDatos.dia);    

    // Guardado
    cy.get('button[type="submit"]').contains('Guardar').click();

    // Verificación de éxito
    cy.wait('@apiGuardarTarifa').its('response.statusCode').should('eq', 200);
    cy.contains('Tarifa guardada').should('be.visible'); 
    cy.contains(nuevosDatos.minuto).should('be.visible'); 
    cy.contains(nuevosDatos.hora).should('be.visible');   
    cy.contains(nuevosDatos.dia).should('be.visible');    
  });

  /**
   * CASO 30:
    Similar al caso de campo vacío, verifica que el formulario rechace entradas negativas 
    en campos monetarios.
    - Pasa
   */
  it('Caso 30: Validar que no se pueda ingresar valores negativos en el campo de monto hora', () => {
    const datosPrueba = {
      minuto: '160',
      hora: '-4000', // Valor inválido
      dia: '12000'
    };

    cy.contains('a', 'Tarifas').click();
    cy.url().should('include', '/tarifas');

    // Llenado del formulario
    cy.contains('label', 'Tipo de vehículo').parent().find('select').select('Carro', { force: true });
    cy.contains('label', 'Modo de cobro').parent().find('select').select('Mixto', { force: true });
    cy.contains('label', 'Valor minuto').parent().find('input').clear().type(datosPrueba.minuto); 
    cy.contains('label', 'Valor hora').parent().find('input').clear().type(datosPrueba.hora);  
    cy.contains('label', 'Valor día').parent().find('input').clear().type(datosPrueba.dia);    

    cy.get('button[type="submit"]').contains('Guardar').click();

    // Verificación de invalidez
    cy.contains('label', 'Valor hora')
      .parent().find('input')
      .then(($input) => {
        expect($input[0].checkValidity()).to.be.false;
      });
  });

  /**
   * CASO 31: 
    Verifica que el sistema acepte valores decimales, necesarios para tarifas exactas.
    -Pasa
   */
  it('Caso 31: Verificar que el sistema acepte valores decimales en tarifas', () => {
    const datosPrueba = {
      minuto: '1.20',
      hora: '6.1',
      dia: '8.2'
    };

    cy.contains('a', 'Tarifas').click();
    cy.url().should('include', '/tarifas');

    // Configuración
    cy.contains('label', 'Tipo de vehículo').parent().find('select').select('Bicicleta', { force: true });
    cy.contains('label', 'Modo de cobro').parent().find('select').select('Mixto', { force: true });

    // Ingreso de decimales
    cy.contains('label', 'Valor minuto').parent().find('input').clear().type(datosPrueba.minuto); 
    cy.contains('label', 'Valor hora').parent().find('input').clear().type(datosPrueba.hora);  
    cy.contains('label', 'Valor día').parent().find('input').clear().type(datosPrueba.dia);    

    cy.get('button[type="submit"]').contains('Guardar').click();

    cy.contains('Tarifa guardada').should('be.visible'); 
  });
  
  /**
   * CASO 32: 
    Prueba de robustez para asegurar que el input no acepte símbolos o letras donde solo deberían ir números.
    - Pasa
   */
  it('Caso 32: Validar que el sistema no permite caracteres no numéricos en los campos del formulario de tarifas.', () => {
    const datosPrueba = {
      minuto: '!@#$%%%$#@', // Cualquier caracter
      hora: '6.1',
      dia: '8.2'
    };

    cy.contains('a', 'Tarifas').click();
    cy.url().should('include', '/tarifas');

    // Llenado del formulario
    cy.contains('label', 'Tipo de vehículo').parent().find('select').select('Bicicleta', { force: true });
    cy.contains('label', 'Modo de cobro').parent().find('select').select('Mixto', { force: true });
    cy.contains('label', 'Valor minuto').parent().find('input').clear().type(datosPrueba.minuto); 
    cy.contains('label', 'Valor hora').parent().find('input').clear().type(datosPrueba.hora);  
    cy.contains('label', 'Valor día').parent().find('input').clear().type(datosPrueba.dia);    

    cy.get('button[type="submit"]').contains('Guardar').click();

    // Validación de rechazo
    cy.contains('label', 'Valor minuto')
      .parent().find('input')
      .then(($input) => {
        expect($input[0].checkValidity()).to.be.false;
      });
  });

  /**
   * CASO 33: 
    Verifica que los datos NO se guarden temporalmente si el usuario sale de la página sin guardar.
      1. Llena un formulario parcialmente.
      2. Navega a otra sección ('Usuarios').
      3. Regresa a 'Tarifas'.
      4. Verifica que el campo esté vacío.
    - Pasa
   */
  it('Caso 33: Verificar que los cambios no se guarden si se cierra la página sin presionar Guardar', () => {
    cy.contains('a', 'Tarifas').click();
    cy.url().should('include', '/tarifas');

    // Modificación de campos sin guardar
    cy.contains('label', 'Tipo de vehículo').parent().find('select').select('Bicicleta', { force: true });
    cy.contains('label', 'Modo de cobro').parent().find('select').select('Por hora', { force: true }); 
    cy.contains('label', 'Valor hora').parent().find('input').clear().type('1.20');

    // Navegación fuera y retorno
    cy.contains('a', 'Usuarios').click({ force: true });
    cy.url().should('include', '/usuarios');
    cy.contains('a', 'Tarifas').click({ force: true });

    // Verificación de estado limpio
    cy.contains('label', 'Valor hora')
      .parent().find('input')
      .then(($input) => {
        expect($input[0].checkValidity()).to.be.false;
      });
  });

  /**
   * CASO 34: 
    Verifica que, tras un guardado exitoso, el formulario se limpie automáticamente
    para permitir una nueva entrada sin borrar manualmente.
    -NO pasa
   */
  it('Caso 34: Comprobar que se limpie el formulario después de guardar una tarifa', () => {
    cy.contains('a', 'Tarifas').click({ force: true });
    cy.url().should('include', '/tarifas');

    // Llenado y guardado
    cy.contains('label', 'Tipo de vehículo').parent().find('select').select('Bicicleta', { force: true });
    cy.contains('label', 'Modo de cobro').parent().find('select').select('Por hora', { force: true });
    cy.contains('label', 'Valor hora').parent().find('input').clear().type('1.50');

    cy.get('button[type="submit"]').contains('Guardar').click();

    // Verificación de guardado exitoso
    cy.wait('@apiGuardarTarifa').its('response.statusCode').should('eq', 200);
    cy.contains('Tarifa guardada').should('be.visible'); 

    // Verificación de que el input ahora está vacío
    cy.contains('label', 'Valor hora')
      .parent().find('input')
      .should('have.value', ''); 
  });

});