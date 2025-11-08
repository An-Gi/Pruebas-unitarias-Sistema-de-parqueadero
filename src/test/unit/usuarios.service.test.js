const { listarUsuariosPorEmpresa } = require('../../routes/usuarios.service');




//Mock del pool
const pool = { query: jest.fn() };

describe('Pruebas unitarias para listarUsuariosPorEmpresa()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('13. debería devolverse todos los usuarios de la empresa correctamente', async () => {
    const mockUsuarios = [
      { id_usuario: 1, nombre: 'Quintana', usuario_login: 'kingtana01', rol: 'admin', activo: true },
      { id_usuario: 2, nombre: 'Pepe', usuario_login: 'pepillo02', rol: 'empleado', activo: true },
    ];

    pool.query.mockResolvedValueOnce([mockUsuarios]);

    const result = await listarUsuariosPorEmpresa(pool, 5);

    expect(result).toEqual({
      success: true,
      message: 'Usuarios obtenidos exitosamente',
      data: mockUsuarios,
    });
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id_usuario'),
      [5]
    );
  });

  it('14. debería devolverse un mensaje si no hay usuarios registrados', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const result = await listarUsuariosPorEmpresa(pool, 5);

    expect(result).toEqual({
      success: false,
      message: 'No hay usuarios registrados para esta empresa',
      data: [],
    });
  });
});