const { getTurnoAbierto } = require('../../routes/turnos.service');
const { getTotalesSistema } = require('../../routes/turnos.service');
const { getConteoTickets } = require('../../routes/turnos.service');
const {obtenerTurnoActual} = require('../../routes/turnos.service');
const { abrirTurno } = require('../../routes/turnos.service');

//Mock del pool
const pool = { query: jest.fn() };

describe('Pruebas unitarias para getTurnoAbierto()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('15.debería devolver el turno abierto más reciente correctamente', async () => {
    const mockTurno = [
      { id_turno: 10, id_empresa: 3, estado: 'abierto', fecha_apertura: '2025-10-28 08:00:00' },
    ];

    pool.query.mockResolvedValueOnce([mockTurno]);

    const result = await getTurnoAbierto(pool, 3);

    expect(result).toEqual({
      success: true,
      message: 'Turno abierto encontrado',
      data: mockTurno[0],
    });

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM turnos WHERE id_empresa=? AND estado="abierto" ORDER BY fecha_apertura DESC LIMIT 1',
      [3]
    );
  });

  it('16. debería devolver null si no hay turnos abiertos', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const result = await getTurnoAbierto(pool, 3);

    expect(result).toEqual({
      success: false,
      message: 'No hay turno abierto para esta empresa',
      data: null,
    });
  });
});


describe('Pruebas unitarias para getTotalesSistema()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('17. debería devolver los totales correctamente cuando hay pagos registrados', async () => {
    const mockData = [
      {
        efectivo: 10000,
        tarjeta: 5000,
        qr: 3000,
        total: 18000,
      },
    ];

    pool.query.mockResolvedValueOnce([mockData]);

    const result = await getTotalesSistema(pool, 1, '2025-10-01', '2025-10-31');

    expect(result).toEqual({
      efectivo: 10000,
      tarjeta: 5000,
      qr: 3000,
      total: 18000,
    });

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      [1, '2025-10-01', '2025-10-31']
    );
  });

  it('18. debería devolver ceros si no hay registros de pagos', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const result = await getTotalesSistema(pool, 1, '2025-10-01', '2025-10-31');

    expect(result).toEqual({
      efectivo: 0,
      tarjeta: 0,
      qr: 0,
      total: 0,
    });
  });

  //Muy parecida a la anterior pero con valores nulos
  it('19. debería manejar correctamente los valores nulos dentro de los resultados', async () => {
    const mockData = [{ efectivo: null, tarjeta: null, qr: null, total: null }];
    pool.query.mockResolvedValueOnce([mockData]);

    const result = await getTotalesSistema(pool, 1, '2025-10-01', '2025-10-31');

    expect(result).toEqual({
      efectivo: 0,
      tarjeta: 0,
      qr: 0,
      total: 0,
    });
  });
});


describe('Pruebas unitarias para getConteoTickets()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('20. debería devolver el conteo correcto de tickets por tipo', async () => {
    const mockRows = [
      { tipo: 'carro', cnt: 10 },
      { tipo: 'moto', cnt: 8 },
      { tipo: 'bici', cnt: 5 },
    ];

    pool.query.mockResolvedValueOnce([mockRows]);

    const result = await getConteoTickets(pool, 1, '2025-10-01', '2025-10-31');

    expect(result).toEqual({
      success: true,
      total: 23,
      porTipo: { carro: 10, moto: 8, bici: 5 },
    });

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT v.tipo, COUNT(*)'),
      [1, '2025-10-01', '2025-10-31']
    );
  });

  it('21. debería devolver ceros si no hay registros', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const result = await getConteoTickets(pool, 1, '2025-10-01', '2025-10-31');

    expect(result).toEqual({
      success: true,
      total: 0,
      porTipo: { carro: 0, moto: 0, bici: 0 },
    });
  });

  it('22. debería ignorar tipos desconocidos y no afectar el conteo', async () => {
    const mockRows = [
      { tipo: 'carro', cnt: 4 },
      { tipo: 'camion', cnt: 50 }, //Tipo no esperado
    ];

    pool.query.mockResolvedValueOnce([mockRows]);

    const result = await getConteoTickets(pool, 2, '2025-10-01', '2025-10-31');

    expect(result).toEqual({
      success: true,
      total: 4,
      porTipo: { carro: 4, moto: 0, bici: 0 },
    });
  });
});



describe('Pruebas unitarias para obtenerTurnoActual()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('23. debería devolver el turno activo más reciente correctamente', async () => {
    const mockTurno = [
      {
        id_turno: 12,
        id_empresa: 5,
        estado: 'abierto',
        fecha_apertura: '2025-10-28 08:00:00',
      },
    ];

    pool.query.mockResolvedValueOnce([mockTurno]);

    const result = await obtenerTurnoActual(pool, 5);

    expect(result).toEqual({
      success: true,
      message: 'Turno activo encontrado',
      data: mockTurno[0],
    });

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM turnos WHERE id_empresa=? AND estado="abierto" ORDER BY fecha_apertura DESC LIMIT 1',
      [5]
    );
  });

  it('24. debería devolver un mensaje de que no hay turno activo si no hay registros', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const result = await obtenerTurnoActual(pool, 5);

    expect(result).toEqual({
      success: true,
      message: 'No hay turno activo',
      data: null,
    });
  });
});


describe('Pruebas unitarias para abrirTurno()', () => {
  const mockPool = { query: jest.fn() };
  const id_empresa = 1;
  const id_usuario = 10;

  beforeEach(() => jest.clearAllMocks());

  it('25. debería poderse abrir un turno nuevo correctamente', async () => {
    const mockResult = { insertId: 123 };

    //Simula que no hay turnos abiertos
    mockPool.query
      .mockResolvedValueOnce([[]]) 
      .mockResolvedValueOnce([mockResult]); 

    const result = await abrirTurno(mockPool, id_empresa, id_usuario, 1000, 'Inicio de jornada');

    expect(result).toEqual({
      success: true,
      data: { id_turno: 123 },
    });

    expect(mockPool.query).toHaveBeenCalledTimes(2);
    expect(mockPool.query).toHaveBeenNthCalledWith(
      1,
      'SELECT id_turno FROM turnos WHERE id_empresa=? AND estado="abierto"',
      [id_empresa]
    );
    expect(mockPool.query).toHaveBeenNthCalledWith(
      2,
      'INSERT INTO turnos (id_empresa,id_usuario,base_inicial,observacion_apertura) VALUES (?,?,?,?)',
      [id_empresa, id_usuario, 1000, 'Inicio de jornada']
    );
  });

  it('26. debería devolverse error si ya existe un turno abierto', async () => {
    const mockAbiertos = [{ id_turno: 5 }];

    mockPool.query.mockResolvedValueOnce([mockAbiertos]);

    const result = await abrirTurno(mockPool, id_empresa, id_usuario, 500, 'Intento duplicado');

    expect(result).toEqual({
      success: false,
      message: 'Ya existe un turno abierto',
      data: null,
    });

    //Solo se debe ejecutar una consulta (la de verificación)
    expect(mockPool.query).toHaveBeenCalledTimes(1);
  });
});