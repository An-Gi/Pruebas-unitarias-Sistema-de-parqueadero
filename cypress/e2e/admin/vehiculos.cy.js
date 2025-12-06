// Hay que verificar que no exista ningun vehiculo con la misma placa antes de ejecutar la prueba
describe('PSTC - Vehículos', () => {

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();

    // Iniciar sesión
    cy.visit('http://localhost:3000');
    cy.get('#empresa').clear().type('900123456-7');
    cy.get('#usuario').type('admin');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();

    // Verificar que entró al dashboard
    cy.url().should('include', '/admin/dashboard');

    // Ir a la página de Vehículos
    cy.visit('http://localhost:3000/admin/vehiculos.html');

  });


//No debe existir ningun vehiculo con esta misma placa
  it('Caso 1: Verificar que se pueda ingresar un vehículo con datos válidos', () => {

    // Abrir modal
    cy.get('button.btn.btn-primary').contains('Nuevo Vehículo').click();

    // Llenar formulario
    cy.get('#placa').type('LEO-567');
    cy.get('#tipo').select('carro');     
    cy.get('#color').type('Azul');
    cy.get('#modelo').type('Coupe');

    // Click botón Guardar
    cy.get('#btnGuardar').click();

    // Verificar que el vehículo aparezca en la tabla
    cy.contains('td', 'LEO-567').should('exist');
    cy.contains('td', 'carro').should('exist');
    cy.contains('td', 'Azul').should('exist');
    cy.contains('td', 'Coupe').should('exist');
  });



it('Caso 3: Verificar que no se pueda ingresar un vehículo con tipo inválido', () => {

  // Abrir modal
  cy.get('button.btn.btn-primary').contains('Nuevo Vehículo').click();

  // Completar Placa
  cy.get('#placa').clear().type('BIZ-098');

  // Seleccionar opción inválida
  cy.get('#tipo').select('');

  // Completar los demás campos
  cy.get('#color').type('Verde');
  cy.get('#modelo').type('Sedan');

  // Intentar guardar
  cy.get('#btnGuardar').click();

  cy.get('#vehiculoModal').should('have.class', 'show');

  cy.get('#tipo:invalid').should('exist');
});


//No debe existir ningun vehiculo con esta placa si no la prueba falla por eso
it('Caso 5: Verificar que no se pueda ingresar un vehículo con el campo de "modelo" vacío ', () => {

  // Abrir el modal de nuevo vehículo
  cy.contains('button', 'Nuevo Vehículo').click();

  cy.get('#placa').clear().type('TIC-321');

  cy.get('#tipo').select('carro');

  // Dejar el modelo vacío
  cy.get('#modelo').clear();

  cy.get('#color').clear().type('Negro');

  // Intentar guardar
  cy.get('#btnGuardar').click();

  cy.get('#vehiculoModal').should('have.class', 'show');

  // Validación del campo modelo requerido 
  cy.get('#modelo:invalid').should('exist');  


});



//Debe existir un vehiculo con esta misma placa para que la prueba pase
it('Caso 8: Verificar que no se pueda ingresar un vehículo con la misma placa más de una vez (no duplicidad)', () => {

  // Abrir modal
  cy.contains('button', 'Nuevo Vehículo').click();

  // Llenar los campos
  cy.get('#placa').clear().type('LEO-567');
  cy.get('#tipo').select('carro');
  cy.get('#modelo').clear().type('Sedan');
  cy.get('#color').clear().type('Azul');

  // Guardar
  cy.get('#btnGuardar').click();

  // El modal NO debe cerrarse si falla
  cy.get('#vehiculoModal').should('have.class', 'show');

  // La tabla no debe agregar ninguna nueva fila con placa duplicada
  cy.get('td').contains('LEO-567')
    .its('length')
    .should('eq', 1); // solo debe existir una

});



//No debe existir el vehiculo
it('Caso 13: Verificar que al buscar por placa un vehículo que no está registrado, no se muestre ningún resultado', () => {
  
  // Escribe la placa inexistente en el buscador
  cy.get('#filtroPlaca').clear().type('OEL-567');

  // Esperar un momento si el filtro es en vivo
  cy.wait(500);

  // Verificar que DataTables muestre la fila especial
  cy.get('#vehiculosTable tbody td.dataTables_empty')
    .should('exist')
    .and('contain', 'No matching records found');

  // También se puede validar que no aparezca la placa buscada
  cy.contains('td', 'OEL-567').should('not.exist');

});



//Debe existir el vehiculo
it('Caso 14: Verificar que al buscar por placa un vehículo que sí está registrado, se muestre como resultado', () => {

  // Buscar la placa existente
  cy.get('#filtroPlaca').clear().type('LEO-567');

  // DataTables procesa con un ligero delay
  cy.wait(500);

  // Verificar que NO aparezca la fila de "sin resultados"
  cy.get('#vehiculosTable tbody td.dataTables_empty').should('not.exist');

  // Verificar que la tabla muestre exactamente una fila coincidente
  cy.get('#vehiculosTable tbody tr').should('have.length.at.least', 1);

  // Verificar que en esa fila aparezca la placa buscada
  cy.get('#vehiculosTable tbody tr td').first() .should('contain', 'LEO-567');
});


it('Caso 17: Verificar que al eliminar un vehículo del registro, efectivamente se borre', () => {
  
  // Esperar a que cargue DataTables
  cy.wait(1000);

  //Guardar la placa ANTES de eliminar
  cy.get('#vehiculosTable tbody tr').first().find('td').eq(0)
    .invoke('text')
    .then((texto) => {
      const placaEliminada = texto.trim();
      cy.wrap(placaEliminada).as('placaEliminada');
    });

  //Hacer clic en el botón eliminar de la primera fila
  cy.get('#vehiculosTable tbody tr').first()
    .find('button.btn-danger')
    .click();

  //Aceptar confirmación
  cy.on('window:confirm', () => true);

  //Esperar a que la tabla se recargue
  cy.wait(1000);

  //Buscar por la placa que se guardó ANTES
  cy.get('@placaEliminada').then((placa) => {
    cy.get('#filtroPlaca').clear().type(placa);
    cy.wait(500);

    //Verificar que ya no existe
    cy.get('#vehiculosTable tbody td.dataTables_empty').invoke('text').then((text) => {
    expect(text.trim()).to.match(/No se encontraron resultados|No matching records found/);
  });
  });

});



  it('Caso 2: Verificar que no se pueda ingresar un vehículo con el campo de "placa" vacío', () => {

  // Abrir modal
  cy.get('button.btn.btn-primary').contains('Nuevo Vehículo').click();

  // Placa vacía
  cy.get('#placa').clear();

  // Completar los demás campos
  cy.get('#tipo').select('carro');
  cy.get('#color').type('Rojo');
  cy.get('#modelo').type('SUV');

  // Intentar Guardar
  cy.get('#btnGuardar').click();

  cy.wait(2000);

  // El modal NO debe cerrarse
  cy.get('#vehiculoModal').should('have.class', 'show');

  // Validación del campo placa requerido
  cy.get('#placa:invalid').should('exist'); 


});



//Debe existir al menos un vehiculo cuyo modelo sea SUV
it('Caso 15: Verificar que al buscar se muestren como resultado solo los vehículos que coinciden con lo buscado', () => {

  // Buscar el input global de DataTables
  cy.get('input[type="search"]').as('buscador');

  // Escribir "SUV"
  cy.get('@buscador').clear().type('SUV');

  // Esperar a que DataTables filtre
  cy.wait(500);

  // Validar que cada fila visible contiene el texto "SUV"
  cy.get('#vehiculosTable tbody tr:visible').each($row => {
    cy.wrap($row).should('contain.text', 'SUV');
  });

  // Validar que al menos 1 resultado coincide
  cy.get('#vehiculosTable tbody tr:visible')
    .should('have.length.greaterThan', 0);
});


});
