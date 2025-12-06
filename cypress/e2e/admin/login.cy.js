describe('Login - PSTC-21: Inicio de sesión exitoso', () => {

  it('Caso 19: Verificar que se puede iniciar sesión correctamente con datos de ingreso válidos', () => {

    cy.visit('http://localhost:3000');

    cy.get('#empresa').clear().type('900123456-7');
    cy.get('#usuario').clear().type('admin');
    cy.get('#password').clear().type('admin123');

    cy.get('#loginForm').submit();

    // Espera hasta 10 segundos por la redirección
    cy.url({ timeout: 10000 }).should('include', '/admin/dashboard');

    // Verifica que el dashboard realmente cargó
    cy.contains('Dashboard', {timeout: 10000}).should('exist');
  });

});


describe('Login - Inicio de sesión fallido', () => {

    beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('http://localhost:3000');
  });

  it('Caso 21: Verificar que no se pueda iniciar sesión correctamente con el campo de NIT de empresa vacío', () => {

    cy.visit('http://localhost:3000');

    cy.intercept('POST', '**/auth/login').as('loginRequest');

    // Limpia y deja el NIT vacío
    cy.get('#empresa').clear();

    // Usuario y contraseña válidos
    cy.get('#usuario').clear().type('admin');
    cy.get('#password').clear().type('admin123');

    // Intenta enviar el formulario
    cy.get('#loginForm').submit();

    // 1. El input debe estar inválido
    cy.get('#empresa').then(($input) => {
      expect($input[0].checkValidity()).to.be.false; //HTML debería marcar inválido
    });

    cy.url().should('eq', 'http://localhost:3000/');
  });


    it('Caso 22: Verificar que se no pueda iniciar sesión correctamente con el campo de nombre de usuario vacío', () => {

    cy.intercept('POST', '**/auth/login').as('loginRequest');

    // Llenar NIT empresa correctamente
    cy.get('#empresa').clear().type('900123456-7');

    // Usuario vacío
    cy.get('#usuario').clear();

    // Llenar contraseña válida
    cy.get('#password').clear().type('admin123');

    // Intentar enviar formulario
    cy.get('#loginForm').submit();

    // 1. Validar que el input usuario está inválido según validación nativa
    cy.get('#usuario').then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
    });

    cy.url().should('eq', 'http://localhost:3000/');
  });


    it('Caso 23: Verificar que se no pueda iniciar sesión correctamente con el campo de contraseña vacío', () => {

    cy.visit('http://localhost:3000');

    cy.intercept('POST', '**/auth/login').as('loginRequest');

    // Llenar NIT empresa correctamente
    cy.get('#empresa').clear().type('900123456-7');

    // Usuario válido
    cy.get('#usuario').clear().type('admin');

    // contraseña vacía
    cy.get('#password').clear();

    // Intentar enviar formulario
    cy.get('#loginForm').submit();

    // 1. Validar que el input contraseña está inválido según validación nativa
    cy.get('#password').then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
    });

    cy.url().should('eq', 'http://localhost:3000/');
  });


    it('Caso 24: Verificar que se no pueda iniciar sesión correctamente con un usuario inexistente', () => {

    cy.visit('http://localhost:3000');

    cy.intercept('POST', '**/auth/login').as('loginRequest');

    // Llenar el formulario con datos incorrectos de usuario
    cy.get('#empresa').clear().type('900123456-7');
    cy.get('#usuario').clear().type('koala'); // usuario que no existe
    cy.get('#password').clear().type('admin123');

    cy.get('#loginForm').submit();

    // Esperar la respuesta del backend
    cy.wait('@loginRequest').then((interception) => {
      
      // 1. El backend debe devolver error
      expect(interception.response.statusCode).to.be.oneOf([400, 401]);

      // 2. El backend debe indicar error en su mensaje
      expect(interception.response.body.success).to.be.false;
    });

    // 3. Validar que NO redirige al dashboard
    cy.url().should('not.include', '/admin/dashboard');
  });
  



  it('Caso 25: Verificar que se no pueda iniciar sesión correctamente con una contraseña que no es la del usuario', () => {

    cy.visit('http://localhost:3000');

    cy.intercept('POST', '**/auth/login').as('loginRequest');

    // Llenar el formulario con datos incorrectos de usuario
    cy.get('#empresa').clear().type('900123456-7');
    cy.get('#usuario').clear().type('admin'); 
    cy.get('#password').clear().type('koalita123'); // Contraseña incorrecta

    cy.get('#loginForm').submit();

    // Esperar la respuesta del backend
    cy.wait('@loginRequest').then((interception) => {
      
      // 1. El backend debe devolver error
      expect(interception.response.statusCode).to.be.oneOf([400, 401]);

      // 2. El backend debe indicar error en su mensaje
      expect(interception.response.body.success).to.be.false;
    });

    // 3. Validar que NO redirige al dashboard
    cy.url().should('not.include', '/admin/dashboard');
  });

});