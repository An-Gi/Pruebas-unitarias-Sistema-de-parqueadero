const router = require('../../../src/routes/movimientos');
const calcularTotalMixto = router.calcularTotalMixto;
const calcularTotal = router.calcularTotal;

describe('PRUEBAS UNITARIAS MOVIMIENTOS', () => {
  
  
  it('1. calcularTotal modo minuto retorna total correcto', () => {
    const tarifa = { modo_cobro: 'minuto', valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000 };
    expect(calcularTotal({ minutos: 60, tarifa }).total).toBe(6000);
  });

  it('2. calcularTotal modo minuto retorna minutos correctos', () => {
    const tarifa = { modo_cobro: 'minuto', valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000 };
    expect(calcularTotal({ minutos: 60, tarifa }).minutos).toBe(60);
  });

  it('3. calcularTotal modo minuto con 1 minuto', () => {
    const tarifa = { modo_cobro: 'minuto', valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000 };
    expect(calcularTotal({ minutos: 1, tarifa }).total).toBe(100);
  });

  it('4. calcularTotal modo minuto horas debe ser 0', () => {
    const tarifa = { modo_cobro: 'minuto', valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000 };
    expect(calcularTotal({ minutos: 60, tarifa }).horas).toBe(0);
  });

  it('5. calcularTotal modo minuto dias debe ser 0', () => {
    const tarifa = { modo_cobro: 'minuto', valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000 };
    expect(calcularTotal({ minutos: 60, tarifa }).dias).toBe(0);
  });

  it('6. calcularTotal modo hora con 120 minutos', () => {
    const tarifa = { modo_cobro: 'hora', valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000 };
    expect(calcularTotal({ minutos: 120, tarifa }).total).toBe(8000);
  });

  it('7. calcularTotal modo hora retorna 2 horas', () => {
    const tarifa = { modo_cobro: 'hora', valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000 };
    expect(calcularTotal({ minutos: 120, tarifa }).horas).toBe(2);
  });

  it('8. calcularTotal modo hora redondea hacia arriba 61 minutos', () => {
    const tarifa = { modo_cobro: 'hora', valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000 };
    expect(calcularTotal({ minutos: 61, tarifa }).total).toBe(8000);
  });

  it('9. calcularTotal modo hora con 61 minutos retorna 2 horas', () => {
    const tarifa = { modo_cobro: 'hora', valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000 };
    expect(calcularTotal({ minutos: 61, tarifa }).horas).toBe(2);
  });

  it('10. calcularTotal modo hora con 1 minuto retorna 1 hora', () => {
    const tarifa = { modo_cobro: 'hora', valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000 };
    expect(calcularTotal({ minutos: 1, tarifa }).horas).toBe(1);
  });

  it('11. calcularTotal modo dia con 1440 minutos', () => {
    const tarifa = { modo_cobro: 'dia', valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000 };
    expect(calcularTotal({ minutos: 1440, tarifa }).total).toBe(80000);
  });

  it('12. calcularTotal modo dia retorna 1 día', () => {
    const tarifa = { modo_cobro: 'dia', valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000 };
    expect(calcularTotal({ minutos: 1440, tarifa }).dias).toBe(1);
  });

  it('13. calcularTotal modo dia redondea días hacia arriba', () => {
    const tarifa = { modo_cobro: 'dia', valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000 };
    expect(calcularTotal({ minutos: 1441, tarifa }).total).toBe(160000);
  });

  it('14. calcularTotal modo dia con 1441 minutos retorna 2 días', () => {
    const tarifa = { modo_cobro: 'dia', valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000 };
    expect(calcularTotal({ minutos: 1441, tarifa }).dias).toBe(2);
  });

  it('15. calcularTotal modo dia con 1 minuto retorna 1 día', () => {
    const tarifa = { modo_cobro: 'dia', valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000 };
    expect(calcularTotal({ minutos: 1, tarifa }).dias).toBe(1);
  });

  it('16. calcularTotal modo mixto con 90 minutos', () => {
    const tarifa = { modo_cobro: 'mixto', valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000, paso_minutos_a_horas: 60, paso_horas_a_dias: 8, redondeo_horas: 'arriba', redondeo_dias: 'arriba' };
    expect(calcularTotal({ minutos: 90, tarifa }).total).toBe(10000);
  });

  it('17. calcularTotalMixto retorna objeto con propiedades', () => {
    const tarifa = { valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000, paso_minutos_a_horas: 60, paso_horas_a_dias: 8, redondeo_horas: 'arriba', redondeo_dias: 'arriba' };
    const resultado = calcularTotalMixto(90, tarifa);
    expect(resultado).toHaveProperty('total');
  });

  it('18. calcularTotalMixto retorna propiedad dias', () => {
    const tarifa = { valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000, paso_minutos_a_horas: 60, paso_horas_a_dias: 8, redondeo_horas: 'arriba', redondeo_dias: 'arriba' };
    const resultado = calcularTotalMixto(90, tarifa);
    expect(resultado).toHaveProperty('dias');
  });

  it('19. calcularTotalMixto retorna propiedad horas', () => {
    const tarifa = { valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000, paso_minutos_a_horas: 60, paso_horas_a_dias: 8, redondeo_horas: 'arriba', redondeo_dias: 'arriba' };
    const resultado = calcularTotalMixto(90, tarifa);
    expect(resultado).toHaveProperty('horas');
  });

  it('20. calcularTotalMixto retorna propiedad minutos', () => {
    const tarifa = { valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000, paso_minutos_a_horas: 60, paso_horas_a_dias: 8, redondeo_horas: 'arriba', redondeo_dias: 'arriba' };
    const resultado = calcularTotalMixto(90, tarifa);
    expect(resultado).toHaveProperty('minutos');
  }); 

  it('21. calcularTotalMixto maneja 0 minutos', () => {
    const tarifa = { valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000, paso_minutos_a_horas: 60, paso_horas_a_dias: 8, redondeo_horas: 'arriba', redondeo_dias: 'arriba' };
    expect(calcularTotalMixto(0, tarifa).total).toBe(0);
  });

  it('22. calcularTotalMixto maneja 1 minuto', () => {
    const tarifa = { valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000, paso_minutos_a_horas: 60, paso_horas_a_dias: 8, redondeo_horas: 'arriba', redondeo_dias: 'arriba' };
    expect(calcularTotalMixto(1, tarifa).total).toBe(100);
  });

  it('23. calcularTotal sin modo_cobro usa mixto por defecto', () => {
    const tarifa = { valor_minuto: 100, valor_hora: 4000, valor_dia_completo: 80000, paso_minutos_a_horas: 60, paso_horas_a_dias: 8, redondeo_horas: 'arriba', redondeo_dias: 'arriba' };
    expect(calcularTotal({ minutos: 90, tarifa }).total).toBeGreaterThan(0);
  });

  it('24. calcularTotal convierte string a número', () => {
    const tarifa = { modo_cobro: 'minuto', valor_minuto: '100', valor_hora: '4000', valor_dia_completo: '80000' };
    expect(typeof calcularTotal({ minutos: 60, tarifa }).total).toBe('number');
  });

  it('25. calcularTotal redondea a 2 decimales correctamente', () => {
    const tarifa = { modo_cobro: 'minuto', valor_minuto: 100.5555, valor_hora: 4000, valor_dia_completo: 80000 };
    expect(calcularTotal({ minutos: 10, tarifa }).total).toBe(1005.55);
  });

});
