// AISLANDO LAS FUNCIONALIDADES DE VEHICULOS

async function crearVehiculo(pool, idEmpresa, { placa, tipo, color, modelo }) {
  //Verificar si la placa ya existe
  const [existente] = await pool.query(
    'SELECT id_vehiculo FROM vehiculos WHERE placa = ? AND id_empresa = ?',
    [placa, idEmpresa]
  );

  if (existente.length > 0) {
    return {
      success: false,
      status: 400,
      message: 'Ya existe un vehículo con esta placa'
    };
  }

  //Insertar nuevo vehículo
  const [result] = await pool.query(
    `INSERT INTO vehiculos (id_empresa, placa, tipo, color, modelo)
     VALUES (?, ?, ?, ?, ?)`,
    [idEmpresa, placa, tipo, color, modelo]
  );

  return {
    success: true,
    status: 201,
    message: 'Vehículo registrado exitosamente',
    id: result.insertId
  };
}

async function obtenerVehiculoEspecifico(pool, idVehiculo, idEmpresa) {
  const [vehiculos] = await pool.query(
    'SELECT * FROM vehiculos WHERE id_vehiculo = ? AND id_empresa = ?',
    [idVehiculo, idEmpresa]
  );

  if (vehiculos.length === 0) {
    return {
      success: false,
      message: 'Vehículo no encontrado',
      data: null
    };
  }

  return {
    success: true,
    message: 'Vehículo encontrado',
    data: vehiculos[0]
  };
}



async function actualizarVehiculo(pool, idVehiculo, idEmpresa, datos) {
  const { placa, tipo, color, modelo } = datos;

  try {
    //Verificar si existe otro vehículo con la misma placa
    const [existente] = await pool.query(
      'SELECT id_vehiculo FROM vehiculos WHERE placa = ? AND id_empresa = ? AND id_vehiculo != ?',
      [placa, idEmpresa, idVehiculo]
    );

    if (existente.length > 0) {
      return {
        success: false,
        code: 400,
        message: 'Ya existe otro vehículo con esta placa'
      };
    }

    //Ejecutar la actualización
    await pool.query(
      `UPDATE vehiculos 
       SET placa = ?, tipo = ?, color = ?, modelo = ?
       WHERE id_vehiculo = ? AND id_empresa = ?`,
      [placa, tipo, color, modelo, idVehiculo, idEmpresa]
    );

    return {
      success: true,
      code: 200,
      message: 'Vehículo actualizado exitosamente'
    };
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    return {
      success: false,
      code: 500,
      message: 'Error al actualizar el vehículo'
    };
  }
}


async function obtenerVehiculos(pool, idEmpresa) {
  try {
    const [vehiculos] = await pool.query(
      `SELECT v.*, 
              CASE 
                  WHEN EXISTS (
                      SELECT 1 
                      FROM movimientos m 
                      WHERE m.id_vehiculo = v.id_vehiculo 
                      AND m.fecha_salida IS NULL
                  ) THEN 'activo'
                  ELSE 'inactivo'
              END as estado
       FROM vehiculos v
       WHERE v.id_empresa = ?
       ORDER BY v.fecha_registro DESC`,
      [idEmpresa]
    );

    return { success: true, data: vehiculos };
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    return { success: false, message: 'Error al obtener los vehículos' };
  }
}



async function obtenerHistorialVehiculo(pool, idVehiculo) {
  try {
    const [rows] = await pool.query(
      `SELECT 
          m.id_movimiento,
          m.fecha_entrada,
          m.fecha_salida,
          m.total_a_pagar,
          m.estado,
          t.tipo_vehiculo,
          COALESCE(SUM(p.monto), 0) AS total_pagado,
          COUNT(p.id_pago) AS pagos
       FROM movimientos m
       JOIN tarifas t ON t.id_tarifa = m.id_tarifa
       LEFT JOIN pagos p ON p.id_movimiento = m.id_movimiento
       WHERE m.id_vehiculo = ?
       GROUP BY m.id_movimiento, m.fecha_entrada, m.fecha_salida, 
                m.total_a_pagar, m.estado, t.tipo_vehiculo
       ORDER BY m.fecha_entrada DESC`,
      [idVehiculo]
    );

    if (!rows || rows.length === 0) {
      return {
        success: false,
        message: 'No hay historial para este vehículo',
        data: [],
      };
    }

    return {
      success: true,
      message: 'Historial obtenido correctamente',
      data: rows,
    };
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return {
      success: false,
      message: 'Error al obtener historial',
    };
  }
}



async function eliminarVehiculo(pool, idVehiculo, idEmpresa) {
  try {
    //Verificar si tiene movimientos activos
    const [movimientos] = await pool.query(
      'SELECT id_movimiento FROM movimientos WHERE id_vehiculo = ? AND fecha_salida IS NULL',
      [idVehiculo]
    );

    if (movimientos.length > 0) {
      return {
        success: false,
        message: 'No se puede eliminar un vehículo con movimientos activos',
      };
    }

    //Eliminar el vehículo
    await pool.query(
      'DELETE FROM vehiculos WHERE id_vehiculo = ? AND id_empresa = ?',
      [idVehiculo, idEmpresa]
    );

    return {
      success: true,
      message: 'Vehículo eliminado exitosamente',
    };
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    return {
      success: false,
      message: 'Error al eliminar el vehículo',
    };
  }
}

module.exports = {crearVehiculo, obtenerVehiculoEspecifico, actualizarVehiculo, 
    obtenerVehiculos, obtenerHistorialVehiculo, eliminarVehiculo};

