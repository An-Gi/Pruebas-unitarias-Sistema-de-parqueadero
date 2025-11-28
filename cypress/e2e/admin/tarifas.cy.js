describe('Gestión de Tarifas - Usuario Admin', () => {

  beforeEach(() => {
    const USUARIO = 'admin';
    const PASSWORD = 'admin123'; 

    cy.loginAdmin(USUARIO, PASSWORD);
    cy.intercept('PUT', '/api/tarifas').as('apiGuardarTarifa');
  });
  afterEach(() => {
   
    const sqlRestore = "UPDATE usuarios SET rol = 'admin' WHERE usuario_login = 'admin'";
    cy.task('queryDb', sqlRestore);

    
  });


  it('Caso 26: Debe registrar una nueva tarifa de Carro correctamente', () => {
    cy.contains('a', 'Tarifas').click(); 
    cy.url().should('include', '/tarifas');
  
    cy.contains('label', 'Tipo de vehículo').parent().find('select').select('Carro', { force: true });
    cy.contains('label', 'Modo de cobro').parent().find('select').select('Mixto', { force: true });

    cy.contains('label', 'Valor minuto').parent().find('input').clear().type('120');                      
    cy.contains('label', 'Valor hora').parent().find('input').clear().type('6000');
    cy.contains('label', 'Valor día').parent().find('input').clear().type('30000');


    cy.get('button[type="submit"]').contains('Guardar').click();

    // Verificación
    cy.wait('@apiGuardarTarifa').its('response.statusCode').should('eq', 200);
    cy.contains('Tarifa guardada').should('be.visible'); 
  });

  it('Caso 27: Debe de lanzar un mensaje cuando el campo de minutos está vacío', () => {
    
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
  
  it('Caso 29: Actualizar tarifa de Carro con nuevos valores', () => {

    const nuevosDatos = {
      minuto: '160',
      hora: '4000',
      dia: '12000'
    };

    cy.contains('a', 'Tarifas').click();
    cy.url().should('include', '/tarifas');

    cy.contains('label', 'Tipo de vehículo').parent().find('select').select('Carro', { force: true });
    cy.contains('label', 'Modo de cobro').parent().find('select').select('Mixto', { force: true });


    cy.contains('label', 'Valor minuto')
      .parent().find('input')
      .clear()       
      .type(nuevosDatos.minuto); 

    cy.contains('label', 'Valor hora')
      .parent().find('input')
      .clear()       
      .type(nuevosDatos.hora);  

    cy.contains('label', 'Valor día')
      .parent().find('input')
      .clear()      
      .type(nuevosDatos.dia);    

    cy.get('button[type="submit"]').contains('Guardar').click();

    cy.wait('@apiGuardarTarifa').its('response.statusCode').should('eq', 200);
    cy.contains('Tarifa guardada').should('be.visible'); 


    cy.contains(nuevosDatos.minuto).should('be.visible'); 
    cy.contains(nuevosDatos.hora).should('be.visible');   
    cy.contains(nuevosDatos.dia).should('be.visible');    
  });

  it('Caso 30: Validar que no se pueda ingresar valores negativos en el campo de monto hora', () => {

    const datosPrueba = {
      minuto: '160',
      hora: '-4000',
      dia: '12000'
    };

    cy.contains('a', 'Tarifas').click();
    cy.url().should('include', '/tarifas');

    cy.contains('label', 'Tipo de vehículo').parent().find('select').select('Carro', { force: true });
    cy.contains('label', 'Modo de cobro').parent().find('select').select('Mixto', { force: true });


    cy.contains('label', 'Valor minuto')
      .parent().find('input')
      .clear()       
      .type(datosPrueba.minuto); 

    cy.contains('label', 'Valor hora')
      .parent().find('input')
      .clear()       
      .type(datosPrueba.hora);  

    cy.contains('label', 'Valor día')
      .parent().find('input')
      .clear()      
      .type(datosPrueba.dia);    

    cy.get('button[type="submit"]').contains('Guardar').click();

    cy.contains('label', 'Valor hora')
      .parent()
      .find('input')
      .then(($input) => {
        expect($input[0].checkValidity()).to.be.false;
      });
  });

  it('Caso 31: Verificar que el sistema acepte valores decimales en tarifas', () => {

    const datosPrueba = {
      minuto: '1.20',
      hora: '6.1',
      dia: '8.2'
    };

    cy.contains('a', 'Tarifas').click();
    cy.url().should('include', '/tarifas');

    cy.contains('label', 'Tipo de vehículo').parent().find('select').select('Bicicleta', { force: true });
    cy.contains('label', 'Modo de cobro').parent().find('select').select('Mixto', { force: true });


    cy.contains('label', 'Valor minuto')
      .parent().find('input')
      .clear()       
      .type(datosPrueba.minuto); 

    cy.contains('label', 'Valor hora')
      .parent().find('input')
      .clear()       
      .type(datosPrueba.hora);  

    cy.contains('label', 'Valor día')
      .parent().find('input')
      .clear()      
      .type(datosPrueba.dia);    

    cy.get('button[type="submit"]').contains('Guardar').click();

    cy.contains('Tarifa guardada').should('be.visible'); 
  });
  
  it('Caso 32: Validar que el sistema no permite caracteres no numéricos en los campos del formulario de tarifas.', () => {

    const datosPrueba = {
      minuto: '!@#$%%%$#@',
      hora: '6.1',
      dia: '8.2'
    };

    cy.contains('a', 'Tarifas').click();
    cy.url().should('include', '/tarifas');

    cy.contains('label', 'Tipo de vehículo').parent().find('select').select('Bicicleta', { force: true });
    cy.contains('label', 'Modo de cobro').parent().find('select').select('Mixto', { force: true });


    cy.contains('label', 'Valor minuto')
      .parent().find('input')
      .clear()       
      .type(datosPrueba.minuto); 

    cy.contains('label', 'Valor hora')
      .parent().find('input')
      .clear()       
      .type(datosPrueba.hora);  

    cy.contains('label', 'Valor día')
      .parent().find('input')
      .clear()      
      .type(datosPrueba.dia);    

    cy.get('button[type="submit"]').contains('Guardar').click();

    cy.contains('label', 'Valor minuto')
      .parent()
      .find('input')
      .then(($input) => {
        expect($input[0].checkValidity()).to.be.false;
      });
  });

  it('Caso 33: Verificar que los cambios no se guarden si se cierra la página sin presionar Guardar', () => {

    cy.contains('a', 'Tarifas').click();
    cy.url().should('include', '/tarifas');

    cy.contains('label', 'Tipo de vehículo').parent().find('select').select('Bicicleta', { force: true });

   
    cy.contains('label', 'Modo de cobro')
      .parent().find('select')
      .select('Por hora', { force: true }); 


    cy.contains('label', 'Valor hora')
      .parent().find('input')
      .clear()
      .type('1.20');


    cy.contains('a', 'Usuarios').click({ force: true });
    cy.url().should('include', '/usuarios');

    cy.contains('a', 'Tarifas').click({ force: true });

    cy.contains('label', 'Valor hora')
      .parent()
      .find('input')
      .then(($input) => {
        expect($input[0].checkValidity()).to.be.false;
      });
  });
  it('Caso 34: Comprobar que se limpie el formulario después de guardar una tarifa', () => {
    cy.contains('a', 'Tarifas').click({ force: true });
    cy.url().should('include', '/tarifas');

    cy.contains('label', 'Tipo de vehículo')
      .parent().find('select')
      .select('Bicicleta', { force: true });


    cy.contains('label', 'Modo de cobro')
      .parent().find('select')
      .select('Por hora', { force: true });

    cy.contains('label', 'Valor hora')
      .parent().find('input')
      .clear()
      .type('1.50');

   
    cy.get('button[type="submit"]').contains('Guardar').click();

    cy.wait('@apiGuardarTarifa').its('response.statusCode').should('eq', 200);
    cy.contains('Tarifa guardada').should('be.visible'); 

    cy.contains('label', 'Valor hora')
      .parent().find('input')
      .should('have.value', ''); 

  });

});