//AISLANDO LAS FUNCIONALIDADES DE USUARIOS

async function listarUsuariosPorEmpresa(pool, idEmpresa) {
  try {
    const [rows] = await pool.query(
      `SELECT id_usuario, nombre, usuario_login, rol, activo, ultimo_acceso
       FROM usuarios
       WHERE id_empresa = ?
       ORDER BY id_usuario DESC`,
      [idEmpresa]
    );

    if (rows.length === 0) {
      return {
        success: false,
        message: 'No hay usuarios registrados para esta empresa',
        data: [],
      };
    }

    return {
      success: true,
      message: 'Usuarios obtenidos exitosamente',
      data: rows,
    };
  } catch (error) {
    console.error('Error listando usuarios:', error);
    return {
      success: false,
      message: 'Error listando usuarios',
      data: [],
    };
  }
}

module.exports = {listarUsuariosPorEmpresa};
