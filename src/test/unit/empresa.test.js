// Datos
const infoEmpresa = {
  id_empresa: 1,
  nombre: 'Empresa Dummy',
  nit: '123-456',
  direccion: 'Alajuela',
  telefono: '8888-8888',
  email: 'email@prueba.com',
  activa: true,
  fecha_registro: '2025-01-10 09:15:00',
  plan: 'premium'
};

const configEmpresa = {
  id_configuracion: 1,
  id_empresa: 1,
  capacidad_total_carros: 27,
  capacidad_total_motos: 12,
  capacidad_total_bicicletas: 2003,
  horario_apertura: '06:00:00',
  horario_cierre: '22:00:00',
  iva_porcentaje: 13.00,
  moneda: 'CRC',
  zona_horaria: 'GMT-6',
  operacion_24h: false
};

// Mocks
jest.mock('../config/db', () => ({
  query: jest.fn()
}));

// Dependencias
const rutasEmpresa = require('../routes/empresa');
const dataBase = require('../config/db');

// Simula respuesta Express
function generarRespuesta() {
  const res = {};
  res.statusCode = 200;
  res.status = function(code) {
    res.statusCode = code;
    return res;
  };
  res.jsonPayload = null;
  res.json = function(payload) {
    res.jsonPayload = payload;
    return res;
  };
  return res;
}

describe('Pruebas de la capa service para la ruta "GET /me"', () => {
  let respuesta;
  let handler;
  beforeEach(() => {
    // Se instancia una variable para guardar las respuestas del sistema
    respuesta = generarRespuesta();
    // Se instancia el handler real
    const capaMe = rutasEmpresa.stack.find(
      capa => capa.route && capa.route.path === '/me' && capa.route.methods.get
    );
    handler = capaMe.route.stack.at(-1).handle;
  });

  test('"StatusCode = 404" cuando se busca una empresa que no existe', async () => {
    // Se setea una respuesta vacía
    dataBase.query.mockResolvedValueOnce([[]]);
    // Para realizar la búsqueda
    const solicitud = { user: { id_empresa: 1 } };
    // Se ejecuta el handler
    await handler(solicitud, respuesta);
    // Se verifica que no encontró nada
    expect(respuesta.statusCode).toBe(404);
  });

  test('"StatusCode = 200" cuando se busca una empresa que si existe', async () => {
    // Se setea una respuesta con datos
    dataBase.query.mockResolvedValueOnce([[infoEmpresa]]);
    const solicitud = { user: { id_empresa: 1 } };
    await handler(solicitud, respuesta);
    // Se verifica que encontró la empresa
    expect(respuesta.statusCode).toBe(200);
  });

  test('"StatusCode = 500" cuando se busca una empresa con datos inválidos', async () => {
    // Para realizar la búsqueda con un dato inválido
    const solicitud = 0;
    await handler(solicitud, respuesta);
    // Se verifica que la búsqueda falló
    expect(respuesta.statusCode).toBe(500);
  });

  test('"StatusCode = 500" cuando ocurre un error en la busqueda', async () => {
    // Para simular un error en la base de datos
    dataBase.query.mockRejectedValueOnce(new Error('Error de prueba'));
    const solicitud = { user: { id_empresa: 1 } };
    await handler(solicitud, respuesta);
    expect(respuesta.statusCode).toBe(500);
  });
});

describe('Pruebas de la capa service para la ruta "GET /config"', () => {
  let respuesta;
  let handler;
  beforeEach(() => {
    respuesta = generarRespuesta();
    const capaConfig = rutasEmpresa.stack.find(
      capa => capa.route && capa.route.path === '/config' && capa.route.methods.get
    );
    handler = capaConfig.route.stack.at(-1).handle;
  });

  test('"StatusCode = 404" cuando se busca una empresa que no existe', async () => {
    dataBase.query.mockResolvedValueOnce([[]]);
    const solicitud = { user: { id_empresa: 1 } };
    await handler(solicitud, respuesta);
    expect(respuesta.statusCode).toBe(404);
  });

  test('"StatusCode = 200" cuando se busca una empresa que si existe', async () => {
    dataBase.query.mockResolvedValueOnce([[configEmpresa]]);
    const solicitud = { user: { id_empresa: 1 } };
    await handler(solicitud, respuesta);
    expect(respuesta.statusCode).toBe(200);
  });

  test('"StatusCode = 500" cuando se busca una empresa con datos inválidos', async () => {
    const solicitud = 0;
    await handler(solicitud, respuesta);
    expect(respuesta.statusCode).toBe(500);
  });

    test('"StatusCode = 500" cuando ocurre un error en la busqueda', async () => {
    dataBase.query.mockRejectedValueOnce(new Error('Error de prueba'));
    const solicitud = { user: { id_empresa: 1 } };
    await handler(solicitud, respuesta);
    expect(respuesta.statusCode).toBe(500);
  });
});

describe('Pruebas de la capa service para la ruta "PUT /"', () => {
  let respuesta;
  let handler;
  beforeEach(() => {
    respuesta = generarRespuesta();
    const capaRaiz = rutasEmpresa.stack.find(
      (capa) => capa.route && capa.route.path === '/' && capa.route.methods.put
    );
    handler = capaRaiz.route.stack.at(-1).handle;
  });

  test('"StatusCode = 400" cuando se solicita una modificación sin brindar datos', async () => {
    // Solicitud de cambiar nada
    const solicitud = { body: {} };
    await handler(solicitud, respuesta);
    // Se verifica que no se cambió nada
    expect(respuesta.statusCode).toBe(400);
  });

  test('"StatusCode = 200" cuando se modifica al menos un dato de la empresa', async () => {
    // Se simula un UPDATE exitoso
    dataBase.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const solicitud = {
      user: { id_empresa: 1 },
      body: { nombre: 'Nombre prueba' }
    };
    await handler(solicitud, respuesta);
    // Se verifica que se realizó un cambio
    expect(respuesta.statusCode).toBe(200);
  });

  test('"StatusCode = 404" cuando se solicita modificar datos de una empresa que no existe', async () => {
    // UPDATE sin impacto
    dataBase.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const solicitud = { 
      user: { id_empresa: 1 }, 
      body: { nombre: 'Nombre prueba' } 
    };
    await handler(solicitud, respuesta);
    // Se verifica que la empresa a modificar no existe
    expect(respuesta.statusCode).toBe(404);
  });

  test('"StatusCode = 409" cuando se intenta cambiar el NIT de una empresa por el de otra empresa registrada', async () => {
    // Se instancia un error con las caracteristicas necesarias para que caiga dentro del 'catch' de 'ER_DUP_ENTRY'
    const error = new Error('NIT duplicado');
    error.code = 'ER_DUP_ENTRY';
    dataBase.query.mockRejectedValueOnce(error);
    const solicitud = { 
      user: { id_empresa: 1 }, 
      body: { nit: '123-456' } 
    };
    await handler(solicitud, respuesta);
    // Se verifica que al ingresar un NIT duplicado salta el error
    expect(respuesta.statusCode).toBe(409);
  });

  test('"StatusCode = 500" cuando solicita una modificación con datos inválidos', async () => {
    // Para solicitar la modificación con un dato inválido
    const solicitud = 0;
    await handler(solicitud, respuesta);
    // Se verifica que la modificación falló
    expect(respuesta.statusCode).toBe(500);
  });

  test('"StatusCode = 500" cuando ocurre un error inesperado en la modificación', async () => {
    dataBase.query.mockRejectedValueOnce(new Error('Error de prueba'));
    const solicitud = { 
      user: { id_empresa: 1 }, 
      body: { nombre: 'Nombre prueba' } 
    };
    await handler(solicitud, respuesta);
    expect(respuesta.statusCode).toBe(500);
  });
});

