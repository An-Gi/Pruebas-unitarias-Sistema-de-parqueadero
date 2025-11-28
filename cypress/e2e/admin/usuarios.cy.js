describe('Gestión de Usuarios - Administrador', () => {

  beforeEach(() => {

    const USUARIO = 'admin'; 
    const PASSWORD = 'admin123';

    cy.loginAdmin(USUARIO, PASSWORD);

    cy.intercept('POST', '/api/usuarios').as('apiCrearUsuario');
  });
  afterEach(() => {
    const sqlRestore = "UPDATE usuarios SET rol = 'admin' WHERE usuario_login = 'admin'";
    cy.task('queryDb', sqlRestore);

    const sqlClean = "DELETE FROM usuarios WHERE usuario_login LIKE 'jperez'";
    cy.task('queryDb', sqlClean);

    
  });

  it('Caso 35: Verificar que se pueda crear un nuevo usuario con datos válidos', () => {
    

    cy.contains('a', 'Usuarios').click({ force: true });
    cy.url().should('include', '/usuarios');

    cy.contains('button', 'Nuevo Usuario').click();

    cy.contains('h1, h2, h3, div', 'Nuevo Usuario').should('be.visible');

 
    cy.contains('label', 'Nombre')
      .parent().find('input')
      .should('be.visible')
      .type('Juan Pérez');

    cy.contains('label', 'Usuario')
      .parent().find('input')
      .should('be.visible')
      .type('jperez', { force: true });


    cy.contains('label', 'Contraseña')
      .parent().find('input')
      .should('be.visible')
      .type('jp12345');


    cy.contains('label', 'Rol')
      .parent().find('select')
      .select('Administrador', { force: true }); 

    cy.contains('label', 'Activo')
      .parent().find('input[type="checkbox"]')
      .check({ force: true });

    cy.contains('button', 'Guardar').click();

    cy.wait('@apiCrearUsuario').its('response.statusCode').should('eq', 200);

    cy.contains('Usuario creado').should('be.visible');

  });

   it('Caso 36: Validar que no se pueda crear un usuario con nombre de usuario duplicado.', () => {
    

    cy.contains('a', 'Usuarios').click({ force: true });
    cy.url().should('include', '/usuarios');

    cy.contains('button', 'Nuevo Usuario').click();

    cy.contains('h1, h2, h3, div', 'Nuevo Usuario').should('be.visible');

    cy.contains('label', 'Nombre')
      .parent().find('input')
      .should('be.visible')
      .type('AdminII');

    cy.contains('label', 'Usuario')
      .parent().find('input')
      .should('be.visible')
      .type('admin', { force: true });


    cy.contains('label', 'Contraseña')
      .parent().find('input')
      .should('be.visible')
      .type('admin212321');


    cy.contains('label', 'Rol')
      .parent().find('select')
      .select('Administrador', { force: true }); 

    cy.contains('label', 'Activo')
      .parent().find('input[type="checkbox"]')
      .check({ force: true });

    cy.contains('button', 'Guardar').click();

    cy.wait('@apiCrearUsuario').its('response.statusCode').should('eq', 409);

    cy.contains('Usuario ya existe para esta empresa').should('be.visible');

  });


  it('Caso 37: Verificar que se pueda editar el rol de un usuario existente', () => {
    
    cy.intercept('PUT', '/api/usuarios/*').as('apiEditarUsuario');


    cy.contains('a', 'Usuarios').click({ force: true });
    cy.url().should('include', '/usuarios');

  
    cy.contains('tr', 'admin')
      .find('.fa-edit') 
      .click({ force: true });


    cy.contains('label', 'Rol')
      .parent().find('select')
      .select('Operador', { force: true }); 

    cy.get('button').contains('Guardar').click();

    cy.wait('@apiEditarUsuario').its('response.statusCode').should('eq', 200);
 
    cy.contains('Usuario actualizado').should('be.visible');
  });


  it('Caso 39: Verificar que se registre el campo “Último acceso” correctamente tras iniciar sesión', () => {
    
    const ahora = new Date();
    const dia = ahora.getDate().toString().padStart(2, '0');
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
    const anio = ahora.getFullYear();
    
    const fechaEsperada = `${dia}/${mes}/${anio}`;

    cy.contains('a', 'Usuarios').click({ force: true });
    cy.url().should('include', '/usuarios');

    
    
    cy.contains('tr', 'admin') 
      .should('contain', fechaEsperada); 

  });


  it('Caso 40: Verificar que el sistema no permita guardar un usuario sin contraseña', () => {
    
    cy.contains('a', 'Usuarios').click({ force: true });
    cy.url().should('include', '/usuarios');

    cy.contains('button', 'Nuevo Usuario').click();

    cy.contains('h1, h2, h3, div', 'Nuevo Usuario').should('be.visible');
 
    cy.contains('label', 'Nombre')
      .parent().find('input')
      .should('be.visible')
      .type('Tati Jiménez');

    cy.contains('label', 'Usuario')
      .parent().find('input')
      .should('be.visible')
      .type('tatiji', { force: true });


    cy.contains('label', 'Contraseña')
      .parent().find('input')
      .clear();


    cy.contains('label', 'Rol')
      .parent().find('select')
      .select('Operador', { force: true }); 

    cy.contains('label', 'Activo')
      .parent().find('input[type="checkbox"]')
      .check({ force: true });

    cy.contains('button', 'Guardar').click();
    cy.contains('La contraseña es requerida.').should('be.visible');
  });

  it('Caso 41: Comprobar que no se permita ingresar espacios en blanco en el campo “usuario”.', () => {
    
    cy.contains('a', 'Usuarios').click({ force: true });
    cy.url().should('include', '/usuarios');

    cy.contains('button', 'Nuevo Usuario').click();

    cy.contains('h1, h2, h3, div', 'Nuevo Usuario').should('be.visible');
 
    cy.contains('label', 'Nombre')
      .parent().find('input')
      .should('be.visible')
      .type('Tati Jiménez');

    cy.contains('label', 'Usuario')
      .parent().find('input')
      .should('be.visible')
      .type('tati ji', { force: true });


    cy.contains('label', 'Contraseña')
      .parent().find('input')
      .should('be.visible')
      .type('tati1234');


    cy.contains('label', 'Rol')
      .parent().find('select')
      .select('Operador', { force: true }); 

    cy.contains('label', 'Activo')
      .parent().find('input[type="checkbox"]')
      .check({ force: true });

    cy.contains('button', 'Guardar').click();
    cy.contains('Usuario solo puede tener letras y números (sin espacios ni guiones)').should('be.visible');
  });

  it('Caso 42: Comprobar la extensión para el establecimiento de una contraseña.', () => {
    
    cy.contains('a', 'Usuarios').click({ force: true });
    cy.url().should('include', '/usuarios');

    cy.contains('button', 'Nuevo Usuario').click();

    cy.contains('h1, h2, h3, div', 'Nuevo Usuario').should('be.visible');
 
    cy.contains('label', 'Nombre')
      .parent().find('input')
      .should('be.visible')
      .type('Tati Jiménez');

    cy.contains('label', 'Usuario')
      .parent().find('input')
      .should('be.visible')
      .type('tatajimenez', { force: true });


    cy.contains('label', 'Contraseña')
      .parent().find('input')
      .should('be.visible')
      .type('tati1');


    cy.contains('label', 'Rol')
      .parent().find('select')
      .select('Operador', { force: true }); 

    cy.contains('label', 'Activo')
      .parent().find('input[type="checkbox"]')
      .check({ force: true });

    cy.contains('button', 'Guardar').click();
    cy.contains('La contraseña debe tener al menos 6 caracteres').should('be.visible');
  });
});