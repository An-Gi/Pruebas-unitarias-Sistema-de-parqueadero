const { crearVehiculo } = require('../../routes/vehiculos.service');
const { obtenerVehiculoEspecifico} = require('../../routes/vehiculos.service');
const { actualizarVehiculo } = require('../../routes/vehiculos.service');
const { obtenerVehiculos} = require('../../routes/vehiculos.service');
const { obtenerHistorialVehiculo } = require('../../routes/vehiculos.service');
const { eliminarVehiculo } = require('../../routes/vehiculos.service');

//Mock del pool
const pool = { query: jest.fn() };

describe('Pruebas unitarias para crearVehiculo()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('1. debería crearse un vehículo con datos válidos', async () => {
    pool.query
      .mockResolvedValueOnce([[]]) //No existe la placa
      .mockResolvedValueOnce([{ insertId: 123 }]); //Inserción exitosa

    const result = await crearVehiculo(pool, 1, {
      placa: 'LEO-567',
      tipo: 'Carro',
      color: 'Azul',
      modelo: 'Coupe'
    });

    expect(result).toEqual({
      success: true,
      status: 201,
      message: 'Vehículo registrado exitosamente',
      id: 123
    });
  });

  it('2. debería devolverse error si ya existe un vehículo con esa misma placa', async () => {
    pool.query.mockResolvedValueOnce([[{ id_vehiculo: 1 }]]); //Existe la placa

    const result = await crearVehiculo(pool, 1, {
      placa: 'LEO-567',
      tipo: 'Carro',
      color: 'Azul',
      modelo: 'Coupe'
    });

    expect(result).toEqual({
      success: false,
      status: 400,
      message: 'Ya existe un vehículo con esta placa'
    });
  });


  describe('Pruebas unitarias para obtenerVehiculoEspecifico()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('3. debería devolverse error si el vehículo no está registrado', async () => {
    const mockVehiculo = [{ id_vehiculo: 1, placa: 'XYZ-123'}];
    pool.query.mockResolvedValueOnce([[]]);
    const result = await obtenerVehiculoEspecifico(pool, 999, 1);

    expect(result).toEqual({
      success: false,
      message: 'Vehículo no encontrado',
      data: null
    });

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM vehiculos WHERE id_vehiculo = ? AND id_empresa = ?',
      [999, 1]
    );
  });


  it('4. deberían devolverse los datos del vehículo si existe', async () => {
    const mockVehiculo = [{ id_vehiculo: 1, placa: 'XYZ-123'}];
    pool.query.mockResolvedValueOnce([mockVehiculo]);

    const result = await obtenerVehiculoEspecifico(pool, 1, 1);

    expect(result).toEqual({
      success: true,
      message: 'Vehículo encontrado',
      data: mockVehiculo[0]
    });
  });

});


describe('Pruebas unitarias para actualizarVehiculo()', () => {
  beforeEach(() => jest.clearAllMocks());

  
  it('5: debería actualizarse el vehículo correctamente si la placa es única', async () => {
    pool.query
      .mockResolvedValueOnce([[]]) //1. Verifica placa duplicada pero no hay duplicados
      .mockResolvedValueOnce([{}]); //2. Ejecuta UPDATE

    const result = await actualizarVehiculo(pool, 1, 1, {
      placa: 'XYZ-123',
      tipo: 'Carro',
      color: 'Negro',
      modelo: 'Sedan'
    });

    expect(result).toEqual({
      success: true,
      code: 200,
      message: 'Vehículo actualizado exitosamente'
    });

    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  
  it('6: debería rechazarse la actualización si ya existe otro vehículo con la misma placa', async () => {
    pool.query.mockResolvedValueOnce([[{ id_vehiculo: 2 }]]); //Hay otro vehículo con la placa

    const result = await actualizarVehiculo(pool, 1, 1, {
      placa: 'XYZ-123',
      tipo: 'Carro',
      color: 'Rojo',
      modelo: 'Sedan'
    });

    expect(result).toEqual({
      success: false,
      code: 400,
      message: 'Ya existe otro vehículo con esta placa'
    });

    //Solo se ejecuta la primera consulta (no llega al UPDATE)
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

});


describe('Pruebas unitarias: obtenerVehiculos()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('7: deberían devolverse todos los vehículos de la empresa correctamente', async () => {
    const mockVehiculos = [
      { id_vehiculo: 1, placa: 'XYZ-123', color: 'Rojo', estado: 'activo' },
      { id_vehiculo: 2, placa: 'ABC-456', color: 'Negro', estado: 'inactivo' }
    ];

    //Simula una respuesta correcta del pool
    pool.query.mockResolvedValueOnce([mockVehiculos]);

    const result = await obtenerVehiculos(pool, 1);

    expect(result).toEqual({
      success: true,
      data: mockVehiculos
    });
  });

  it('8: debería devolverse un arreglo vacío si no hay vehículos registrados', async () => {
    //Simula que la consulta devuelve lista vacía
    pool.query.mockResolvedValueOnce([[]]);

    const result = await obtenerVehiculos(pool, 1);

    expect(result).toEqual({
      success: true,
      data: []
    });
  });

});



describe('Pruebas unitarias: obtenerHistorialVehiculo()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('9: debería devolverse el historial correctamente si hay registros', async () => {
    const mockHistorial = [
      {
        id_movimiento: 1,
        fecha_entrada: '2025-10-20',
        fecha_salida: '2025-10-21',
        total_a_pagar: 4000,
        estado: 'pagado',
        tipo_vehiculo: 'Carro',
        total_pagado: 4000,
        pagos: 1,
      },
    ];

    pool.query.mockResolvedValueOnce([mockHistorial]);

    const result = await obtenerHistorialVehiculo(pool, 1);

    expect(result).toEqual({
      success: true,
      message: 'Historial obtenido correctamente',
      data: mockHistorial,
    });
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it('10: debería devolverse un mensaje si no hay historial para el vehículo', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const result = await obtenerHistorialVehiculo(pool, 99);

    expect(result).toEqual({
      success: false,
      message: 'No hay historial para este vehículo',
      data: [],
    });
  });
});


describe('Pruebas unitarias: eliminarVehiculo()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('11. debería eliminarse el vehículo correctamente cuando no tiene movimientos activos', async () => {
    //Simula que no tiene movimientos activos
    pool.query
      .mockResolvedValueOnce([[]]) //Primera consulta: no hay movimientos activos
      .mockResolvedValueOnce([]);  //Segunda consulta: eliminación exitosa

    const result = await eliminarVehiculo(pool, 1, 10);

    expect(result).toEqual({
      success: true,
      message: 'Vehículo eliminado exitosamente',
    });
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  it('12. debería devolverse un error si el vehículo tiene movimientos activos', async () => {
    pool.query.mockResolvedValueOnce([[{ id_movimiento: 99 }]]); //Simula un movimiento activo

    const result = await eliminarVehiculo(pool, 1, 10);

    expect(result).toEqual({
      success: false,
      message: 'No se puede eliminar un vehículo con movimientos activos',
    });
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

});
});
