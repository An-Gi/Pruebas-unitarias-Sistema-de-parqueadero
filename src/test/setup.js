// test/setup.js - Copiar en la carpeta test/

/**
 * ============================================
 * CONFIGURACIÓN GLOBAL PARA TODAS LAS PRUEBAS
 * ============================================
 * 
 * Este archivo se ejecuta ANTES de cada suite de pruebas
 * Se usa para:
 * - Configurar variables de entorno
 * - Crear mocks globales
 * - Configurar el comportamiento de Jest
 */

// ============================================
// 1. CONFIGURAR VARIABLES DE ENTORNO
// ============================================

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-12345-para-desarrollo-solamente';
process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/test_db';
process.env.PORT = 3001;

// ============================================
// 2. AUMENTAR TIMEOUT DE LAS PRUEBAS
// ============================================

jest.setTimeout(10000); // 10 segundos

// ============================================
// 3. CONFIGURAR REPORTE DETALLADO (OPCIONAL)
// ============================================

// Descomenta para ver más detalles en consola
 jest.verbose = true;

// ============================================
// 4. LIMPIAR DESPUÉS DE CADA PRUEBA (OPCIONAL)
// ============================================

afterEach(() => {
  jest.clearAllMocks();     // Limpiar todos los mocks
  jest.restoreAllMocks();   // Restaurar mocks originales
});

// ============================================
// 5. SILENCIAR LOGS DE PRUEBAS (OPCIONAL)
// ============================================

// Descomenta si quieres silenciar los logs durante las pruebas
global.console = {
  ...console,
  error: jest.fn(),  // Silencia console.error
  warn: jest.fn(),
  log: jest.fn()
};

// ============================================
// 6. CONFIGURAR FECHAS DETERMINÍSTICAS (OPCIONAL)
// ============================================

// Descomenta para fijar la fecha en las pruebas
/*
const mockDate = new Date('2025-10-31T12:00:00Z');
global.Date = class extends Date {
  constructor(...args) {
    if (args.length === 0) {
      super(mockDate);
    } else {
      super(...args);
    }
  }

  static now() {
    return mockDate.getTime();
  }
};
*/

// ============================================
// 7. MENSAJE DE BIENVENIDA (OPCIONAL)
// ============================================

// Descomenta para ver mensaje cuando las pruebas comienzan
/*
beforeAll(() => {
  console.log('\n🧪 Iniciando suite de pruebas...\n');
});

afterAll(() => {
  console.log('\n✅ Suite de pruebas finalizada.\n');
});
*/