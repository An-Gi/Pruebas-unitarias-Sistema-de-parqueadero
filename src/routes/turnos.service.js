//AISLANDO LAS FUNCIONALIDADES DE TURNOS
async function getTurnoAbierto(pool, id_empresa) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM turnos WHERE id_empresa=? AND estado="abierto" ORDER BY fecha_apertura DESC LIMIT 1',
      [id_empresa]
    );

    if (rows.length === 0) {
      return {
        success: false,
        message: 'No hay turno abierto para esta empresa',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Turno abierto encontrado',
      data: rows[0],
    };
  } catch (error) {
    console.error('Error al obtener turno abierto:', error);
    return {
      success: false,
      message: 'Error al obtener turno abierto',
      data: null,
    };
  }
}



async function getTotalesSistema(pool, id_empresa, fecha_desde, fecha_hasta) {
  try {
    const [rows] = await pool.query(
      `SELECT 
          SUM(CASE WHEN metodo_pago='efectivo' THEN monto ELSE 0 END) AS efectivo,
          SUM(CASE WHEN metodo_pago='tarjeta' THEN monto ELSE 0 END) AS tarjeta,
          SUM(CASE WHEN metodo_pago='QR' THEN monto ELSE 0 END) AS qr,
          SUM(monto) AS total
       FROM pagos
       WHERE id_empresa=? AND fecha_pago BETWEEN ? AND COALESCE(?, NOW())`,
      [id_empresa, fecha_desde, fecha_hasta || null]
    );

    const r = rows[0] || {};
    return {
      efectivo: Number(r.efectivo || 0),
      tarjeta: Number(r.tarjeta || 0),
      qr: Number(r.qr || 0),
      total: Number(r.total || 0),
    };
  } catch (error) {
    console.error('Error al obtener totales del sistema:', error);
    return {
      efectivo: 0,
      tarjeta: 0,
      qr: 0,
      total: 0,
      error: 'Error al obtener totales del sistema',
    };
  }
}



async function getConteoTickets(pool, id_empresa, fecha_desde, fecha_hasta) {
  try {
    const [rows] = await pool.query(
      `SELECT v.tipo, COUNT(*) as cnt
       FROM movimientos m
       JOIN vehiculos v ON v.id_vehiculo = m.id_vehiculo
       WHERE m.id_empresa=? AND m.estado='finalizado'
         AND m.fecha_salida BETWEEN ? AND COALESCE(?, NOW())
       GROUP BY v.tipo`,
      [id_empresa, fecha_desde, fecha_hasta || null]
    );

    const map = { carro: 0, moto: 0, bici: 0 };
    rows.forEach((r) => {
      if (map[r.tipo] != null) map[r.tipo] = Number(r.cnt || 0);
    });

    return { success: true, total: map.carro + map.moto + map.bici, porTipo: map };
  } catch (error) {
    console.error('Error al obtener conteo de tickets:', error);
    return { success: false, message: 'Error al obtener conteo de tickets', total: 0, porTipo: { carro: 0, moto: 0, bici: 0 } };
  }
}



async function obtenerTurnoActual(pool, id_empresa) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM turnos WHERE id_empresa=? AND estado="abierto" ORDER BY fecha_apertura DESC LIMIT 1',
      [id_empresa]
    );

    const turno = rows[0] || null;

    return {
      success: true,
      message: turno ? 'Turno activo encontrado' : 'No hay turno activo',
      data: turno,
    };
  } catch (error) {
    console.error('Error al obtener turno actual:', error);
    return {
      success: false,
      message: 'Error al obtener turno actual',
      data: null,
    };
  }
}



async function abrirTurno(pool, id_empresa, id_usuario, base_inicial, observacion_apertura) {
  try {
    // Validar que no haya turno abierto
    const [abiertos] = await pool.query(
      'SELECT id_turno FROM turnos WHERE id_empresa=? AND estado="abierto"',
      [id_empresa]
    );

    if (abiertos.length) {
      return { success: false, message: 'Ya existe un turno abierto', data: null };
    }

    // Crear nuevo turno
    const [result] = await pool.query(
      'INSERT INTO turnos (id_empresa,id_usuario,base_inicial,observacion_apertura) VALUES (?,?,?,?)',
      [id_empresa, id_usuario, Number(base_inicial || 0), observacion_apertura || null]
    );

    return { success: true, data: { id_turno: result.insertId } };
  } catch (error) {
    console.error('Error abriendo turno:', error);
    return { success: false, message: 'Error abriendo turno' };
  }
}



module.exports = {getTurnoAbierto, getTotalesSistema, getConteoTickets, obtenerTurnoActual, abrirTurno};