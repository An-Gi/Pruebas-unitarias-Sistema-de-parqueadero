# Sistema de Parqueadero (Multi-empresa)

Aplicación Node.js + Express para gestionar parqueaderos con múltiples empresas, usuarios y operaciones de ingreso/salida de vehículos, tarifas, pagos, reportes y turnos de caja. Incluye una interfaz estática en public/ servida por el mismo servidor.

# Ejecución del proyecto

## Instalación

En la raíz del proyecto se encuentran los pasos originales de instalación y ejecución del proyecto. Toda la información se encuentra en el [README Original](DocumentaciónInstalación.md).

## Testing

Antes de correr las pruebas se debe instalar todas las dependencias con el comando:

```bash
npm install
```

## Pruebas Unitarias

1. Una vez instaladas las dependencias, se ejecuta el siguiente comando en la raíz del proyecto:

```bash
npm test
```

## Pruebas Automatizadas

1. Una vez instaladas las dependencias, se debe levantar el servidor con el siguiente comando:

```bash
npm run dev
```

2. Después de levantar el servidor, abrimos Cypress ejecutando el siguiente comando:

```bash
npx cypress open
```

3. Elegimos las pruebas de _end to end_ (E2E).

4. Elegimos el browser a utilizar (Recomendamos: Firefox, Electron o Google Chrome)

5. Ejecutar los archivos dentro de la carpeta `admin/`.

# Avances realizados

## Avance 1 - 14/10/25 - Entregado

- Plan de calidad reducido
    - Se desarrolló un plan de calidad que plantea la estrategia de aseguramiento de calidad de todo el proyecto. El mismo se encuentra en la carpeta de [documentos](/docs) como `PlanDeCalidad.pdf`.
- Datos y casos de prueba
    - Para cada caso de prueba elaborado se adjuntó el conjunto de datos de prueba a utilizar. Se especificó un conjunto de datos válido que se supone debe pasar exitosamente el caso de prueba y un conjunto de datos que pretenda hacer que el caso de prueba falle.
    - Dentro de la carpeta de [documentos](/docs) se encuentra el archivo `CasosDePrueba.pdf` con toda la información pertinente.

## Avance 2 - 09/11/25 - Entregado

- Pruebas unitarias
    - Se implementaron pruebas para diferentes componentes del proyecto que manejaban la capa de servicios (asumiendo una arquitectura de 3 capas donde la capa intermedia es la de servicios). Las mismas se encuentran dentro de la carpeta de [tests unitarios](src/test/unit/).
- Configuración de herramienta de reportes
    - Para la generación de reportes de pruebas se utilizó Jest, eligiendo V8 como proveedor de cobertura. Se prefirió V8 por encima de Babel debido a que es más rápido, mide directamente el código que ejecuta Node.js y requiere menos configuración adicional.
    - Jest genera el [reporte de cobertura](coverage/lcov-report/index.html) en formato HTML y puede verse en línea desde la [GitHub Page](https://an-gi.github.io/Pruebas-unitarias-Sistema-de-parqueadero/reporte/lcov-report/) del repositorio.

<p align="center">
  <img src="pictures/ReporteDeCobertura.png" alt="Reporte de cobertura" width="750"/>
</p>

## Avance 3 - 07/12/25 - Entregado

- Pruebas automatizadas
    - Se ejecutaron todos los casos de prueba creados en la primera etapa (prueba de regresión completa), logrando automatizar más del 60% de ellos. El código fuente de las pruebas automatizadas se encuentra en la carpeta de [Cypress](cypress/e2e/admin).
    - Se generó un informe detallado de la ejecución, que incluye: descripción general del proceso y ambiente de pruebas, informe de cobertura actualizado, cantidad de casos exitosos y fallidos, clasificación de errores por prioridad, y observaciones. El informe está disponible en [documentos](/docs) como `InformePruebasAutomatizadas.pdf`.
- Informe de reporte de errores
    - Se documentaron todos los errores encontrados durante la ejecución de las pruebas, con reportes de defectos que incluyen pasos para reproducir, severidad, prioridad y estado. El informe de errores se encuentra incluido en el documento `InformePruebasAutomatizadas.pdf`.
- Análisis de los problemas
    - Se realizó un análisis de los problemas encontrados a lo largo del desarrollo del proyecto, incluyendo aspectos técnicos, de coordinación y de planificación. El análisis está disponible en la última página del documento `InformePruebasAutomatizadas.pdf`.
