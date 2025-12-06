describe('Gestión de Usuarios', () => {
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

    cy.intercept('POST', '/api/usuarios').as('apiCrearUsuario');
  });
    /**
    Limpieza,se ejecuta después de cada test.
    -Restaura el rol del usuario en la base de datos para asegurar que el siguiente test comience en un estado limpio.
    -Elimina el usuario 'jperez' para que este no de problemas a la hora de insertarlo de nuevo al probar de 
    nuevo el caso de prueba.
   */
  afterEach(() => {
    const sqlRestore = "UPDATE usuarios SET rol = 'admin' WHERE usuario_login = 'admin'";
    cy.task('queryDb', sqlRestore);

    const sqlClean = "DELETE FROM usuarios WHERE usuario_login LIKE 'jperez'";
    cy.task('queryDb', sqlClean);

    
  });

  /**
   * CASO 35: 
      1. Navega a la sección de Usuarios y va a "Nuevo Usuario".
      2. Llena todos los campos obligatorios.
      3. Selecciona rol y lo marca como activo.
      4. Guarda y valida que la API responda 200 y salga el mensaje de éxito.
      - Pasa
   */
  it('Caso 35: Verificar que se pueda crear un nuevo usuario con datos válidos', () => {
    
    cy.contains('a', 'Usuarios').click({ force: true });
    cy.url().should('include', '/usuarios');

    cy.contains('button', 'Nuevo Usuario').click();

    cy.contains('label', 'Nombre').parent().find('input').should('be.visible').type('Juan Pérez');
    cy.contains('label', 'Usuario').parent().find('input').should('be.visible').type('jperez', { force: true });
    cy.contains('label', 'Contraseña').parent().find('input').should('be.visible').type('jp12345');

    cy.contains('label', 'Rol').parent().find('select').select('Administrador', { force: true }); 
    cy.contains('label', 'Activo').parent().find('input[type="checkbox"]').check({ force: true });

    cy.contains('button', 'Guardar').click();

    cy.wait('@apiCrearUsuario').its('response.statusCode').should('eq', 200);
    cy.contains('Usuario creado').should('be.visible');
  });

   /**
   * CASO 36: 
      Validamos que el sistema no deje crear duplicados.
      1. Entra al formulario de nuevo usuario.
      2. Intenta registrar a alguien con el usuario "admin" (que ya existe).
      3. Guarda y verifica que la API devuelva error 409 y el mensaje adecuado.
      - Pasa
   */
   it('Caso 36: Validar que no se pueda crear un usuario con nombre de usuario duplicado.', () => {
    
    cy.contains('a', 'Usuarios').click({ force: true });
    cy.url().should('include', '/usuarios');

    cy.contains('button', 'Nuevo Usuario').click();

    cy.contains('label', 'Nombre').parent().find('input').should('be.visible').type('AdminII');
    cy.contains('label', 'Usuario').parent().find('input').should('be.visible').type('admin', { force: true }); // Duplicado
    cy.contains('label', 'Contraseña').parent().find('input').should('be.visible').type('admin212321');

    cy.contains('label', 'Rol').parent().find('select').select('Administrador', { force: true }); 
    cy.contains('label', 'Activo').parent().find('input[type="checkbox"]').check({ force: true });

    cy.contains('button', 'Guardar').click();

    cy.wait('@apiCrearUsuario').its('response.statusCode').should('eq', 409);
    cy.contains('Usuario ya existe para esta empresa').should('be.visible');
  });


  /**
   * CASO 37: 
      Verifica la edición de un usuario existente.
      1. Intercepta la petición PUT de edición.
      2. Busca al usuario 'admin' y le da click a editar.
      3. Cambia su rol a 'Operador' y guarda.
      4. Valida que la respuesta sea 200 y salga el mensaje de actualizado.
      - Pasa
   */
  it('Caso 37: Verificar que se pueda editar el rol de un usuario existente', () => {
    
    cy.intercept('PUT', '/api/usuarios/*').as('apiEditarUsuario');

    cy.contains('a', 'Usuarios').click({ force: true });
    cy.url().should('include', '/usuarios');

    cy.contains('tr', 'admin').find('.fa-edit').click({ force: true });

    cy.contains('label', 'Rol').parent().find('select').select('Operador', { force: true }); 

    cy.get('button').contains('Guardar').click();

    cy.wait('@apiEditarUsuario').its('response.statusCode').should('eq', 200);
    cy.contains('Usuario actualizado').should('be.visible');
  });


  /**
   * CASO 39: 
      Comprueba que se actualice la fecha de acceso al loguearse.
      1. Calcula la fecha de hoy manualmente.
      2. Busca en la tabla la fila del usuario 'admin'.
      3. Verifica que esa fila contenga la fecha calculada.
      - Pasa
   */
  it('Caso 39: Verificar que se registre el campo “Último acceso” correctamente tras iniciar sesión', () => {
    
    const ahora = new Date();
    const dia = ahora.getDate().toString(); 
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
    const anio = ahora.getFullYear();
    const fechaEsperada = `${dia}/${mes}/${anio}`;

    cy.contains('a', 'Usuarios').click({ force: true });
    cy.url().should('include', '/usuarios');
  

    cy.contains('tr', 'admin').should('contain', fechaEsperada); 
  });


  /**
   * CASO 40: 
      Valida campos obligatorios (Contraseña).
      1. Abre formulario de nuevo usuario.
      2. Llena todo menos la contraseña (la deja limpia/vacía).
      3. Intenta guardar.
      4. Verifica que salga el mensaje de error de campo requerido.
      - Pasa
   */
  it('Caso 40: Verificar que el sistema no permita guardar un usuario sin contraseña', () => {
    
    cy.contains('a', 'Usuarios').click({ force: true });
    cy.url().should('include', '/usuarios');
    cy.contains('button', 'Nuevo Usuario').click();
 
    cy.contains('label', 'Nombre').parent().find('input').should('be.visible').type('Tati Jiménez');
    cy.contains('label', 'Usuario').parent().find('input').should('be.visible').type('tatiji', { force: true });

    cy.contains('label', 'Contraseña').parent().find('input').clear(); // Vacío

    cy.contains('label', 'Rol').parent().find('select').select('Operador', { force: true }); 
    cy.contains('label', 'Activo').parent().find('input[type="checkbox"]').check({ force: true });

    cy.contains('button', 'Guardar').click();
    cy.contains('La contraseña es requerida.').should('be.visible');
  });

  /**
   * CASO 41: 
      Valida formato del nombre de usuario.
      1. Llena el formulario.
      2. Escribe un usuario con espacio: "tati ji".
      3. Intenta guardar.
      4. Verifica el mensaje de error de formato inválido.
      - Pasa
   */
  it('Caso 41: Comprobar que no se permita ingresar espacios en blanco en el campo “usuario”.', () => {
    
    cy.contains('a', 'Usuarios').click({ force: true });
    cy.url().should('include', '/usuarios');

    cy.contains('button', 'Nuevo Usuario').click();

    cy.contains('label', 'Nombre').parent().find('input').should('be.visible').type('Tati Jiménez');

    // Error intencional: espacio
    cy.contains('label', 'Usuario').parent().find('input').should('be.visible').type('tati ji', { force: true }); 

    cy.contains('label', 'Contraseña').parent().find('input').should('be.visible').type('tati1234');
    cy.contains('label', 'Rol').parent().find('select').select('Operador', { force: true }); 
    cy.contains('label', 'Activo').parent().find('input[type="checkbox"]').check({ force: true });

    cy.contains('button', 'Guardar').click();
    cy.contains('Usuario solo puede tener letras y números (sin espacios ni guiones)').should('be.visible');
  });

  /**
   * CASO 42: 
      Valida longitud mínima de contraseña.
      1. Llena el formulario.
      2. Pone una contraseña de 5 caracteres.
      3. Intenta guardar.
      4. Verifica que pida al menos 6 caracteres.
      - Pasa
   */
  it('Caso 42: Comprobar la extensión para el establecimiento de una contraseña.', () => {
    
    cy.contains('a', 'Usuarios').click({ force: true });
    cy.url().should('include', '/usuarios');

    cy.contains('button', 'Nuevo Usuario').click();
 
    cy.contains('label', 'Nombre').parent().find('input').should('be.visible').type('Tati Jiménez');
    cy.contains('label', 'Usuario').parent().find('input').should('be.visible').type('tatajimenez', { force: true });

    // Contraseña corta
    cy.contains('label', 'Contraseña').parent().find('input').should('be.visible').type('tati1');

    cy.contains('label', 'Rol').parent().find('select').select('Operador', { force: true }); 
    cy.contains('label', 'Activo').parent().find('input[type="checkbox"]').check({ force: true });

    cy.contains('button', 'Guardar').click();
    cy.contains('La contraseña debe tener al menos 6 caracteres').should('be.visible');
  });
});