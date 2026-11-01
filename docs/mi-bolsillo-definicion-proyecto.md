# Mi Bolsillo — Documento de definición del proyecto

> **Versión:** 1.0  
> **Estado:** Definición inicial  
> **Tipo de proyecto:** Aplicación personal de control de gastos  
> **Plataforma de uso:** iPhone (iOS)  
> **Entorno de desarrollo:** Windows

---

## 1. Información general del proyecto

**Mi Bolsillo** será una aplicación personal para registrar, consultar y analizar los gastos cotidianos. El usuario podrá anotar cada gasto, clasificarlo y consultar cuánto ha gastado durante un día, una semana o un mes.

| Característica | Definición |
|---|---|
| Nombre provisional | Mi Bolsillo |
| Tipo | Aplicación web progresiva (PWA) |
| Plataforma principal | iPhone / iOS |
| Sistema de desarrollo | Windows |
| Moneda | Peso colombiano (COP) |
| Usuarios | Un único usuario |
| Almacenamiento | Local en el dispositivo |
| Conexión a internet | Necesaria para la primera carga, instalación y actualizaciones; no para las funciones principales una vez almacenada la aplicación |
| Publicación | No se publicará en App Store |
| Backend | No requiere |
| Base de datos | IndexedDB |

## 2. Finalidad del aplicativo

El propósito principal de Mi Bolsillo es permitir que una persona registre los gastos que realiza durante el día y consulte posteriormente cuánto dinero ha gastado.

Muchos gastos cotidianos se realizan sin llevar un registro detallado. Esto dificulta conocer cuánto dinero se destina a alimentación, transporte, entretenimiento, compras y otras actividades.

La aplicación busca solucionar este problema mediante un sistema de registro sencillo, rápido y organizado.

### 2.1. Objetivo general

Desarrollar una aplicación móvil de uso personal que permita registrar, almacenar, consultar y analizar los gastos realizados por el usuario, proporcionando información sobre el dinero gastado en períodos diarios, semanales y mensuales.

### 2.2. Objetivos específicos

1. Permitir el registro de gastos individuales.
2. Clasificar los gastos mediante categorías predefinidas.
3. Almacenar los registros localmente en el dispositivo.
4. Calcular automáticamente los gastos acumulados.
5. Consultar el historial de movimientos.
6. Filtrar los registros por fechas y períodos.
7. Generar estadísticas para identificar los principales destinos del dinero.

## 3. Alcance funcional

La primera versión será un **MVP (Minimum Viable Product)**: incluirá las funcionalidades necesarias para cumplir el objetivo principal, sin incorporar características que no sean indispensables.

### 3.1. Registro de gastos

Cada vez que el usuario realice un gasto podrá registrar los siguientes datos:

| Campo | Descripción | Obligatorio |
|---|---|---|
| ID | Identificador único del gasto | Automático |
| Descripción | Concepto del gasto | Sí |
| Monto | Valor del gasto en COP | Sí |
| Categoría | Clasificación del gasto | Sí |
| Fecha | Día en que se realizó el gasto | Sí |
| Hora de registro | Momento en que se creó el registro | Automático |

Ejemplo:

| Campo | Valor |
|---|---|
| Descripción | Almuerzo |
| Monto | $18.000 COP |
| Categoría | Alimentación |
| Fecha | 30/10/2026 |
| Hora de registro | 12:30 p. m. |

La fecha del gasto podrá modificarse para registrar gastos anteriores. La fecha y hora de creación se conservarán por separado.

### 3.2. Categorías

Se utilizarán ocho categorías iniciales:

| Categoría | Ejemplos |
|---|---|
| Alimentación | Almuerzo, desayuno, bebidas |
| Transporte | Bus, taxi, gasolina |
| Entretenimiento | Cine, juegos, salidas |
| Compras | Ropa, accesorios, artículos |
| Estudio | Materiales, fotocopias |
| Servicios y facturas | Internet, electricidad |
| Salud | Medicamentos, consultas |
| Otros | Gastos no clasificados |

En la primera versión, las categorías serán predefinidas. No se implementará todavía la creación de categorías personalizadas.

### 3.3. Consulta de gastos y períodos

La aplicación permitirá consultar cuánto dinero se ha gastado en distintos períodos.

#### A. Resumen diario

- Total de gastos realizados durante el día.
- Cantidad de transacciones registradas.
- Desglose por categorías.
- Consulta de días anteriores.

#### B. Resumen semanal

- Total gastado durante la semana.
- Desglose por categorías.
- Consulta de semanas anteriores.
- Comparación con semanas anteriores.

La semana comenzará el lunes y finalizará el domingo.

#### C. Resumen mensual

- Total gastado durante el mes.
- Cantidad de gastos registrados.
- Distribución por categorías.
- Consulta de meses anteriores.
- Comparación con meses anteriores.

Los cálculos se obtendrán sumando los registros almacenados; no se introducirán totales manualmente.

### 3.4. Historial de gastos

El usuario podrá:

- Consultar todos los movimientos registrados.
- Consultar el detalle de un gasto.
- Editar un gasto.
- Eliminar un gasto.
- Filtrar por categoría.
- Filtrar por fecha.
- Consultar los movimientos de un período específico.

Cuando se modifique o elimine un registro, los totales deberán actualizarse.

### 3.5. Estadísticas

La aplicación podrá mostrar:

- Distribución del dinero por categorías.
- Evolución de los gastos a lo largo del tiempo.
- Comparación entre períodos.
- Identificación de las categorías con mayor gasto.

No se implementarán inicialmente recomendaciones financieras, predicciones ni presupuestos.

## 4. Reglas de negocio

Las reglas de negocio definen cómo debe comportarse el sistema, independientemente de su diseño visual.

| Código | Regla |
|---|---|
| RN-01 | Todo gasto debe tener una descripción. |
| RN-02 | El monto debe ser un número mayor que cero. |
| RN-03 | Todo gasto debe pertenecer a una categoría válida. |
| RN-04 | La fecha del gasto debe poder seleccionarse manualmente. |
| RN-05 | La fecha y hora de creación se generarán automáticamente. |
| RN-06 | Los valores monetarios se manejarán en pesos colombianos (COP). |
| RN-07 | Los totales se calcularán a partir de los registros existentes. |
| RN-08 | Los gastos eliminados no deben contabilizarse. |
| RN-09 | Los gastos editados deben reflejarse en todos los resúmenes. |
| RN-10 | Los períodos semanales comenzarán el lunes. |
| RN-11 | Los datos se almacenarán localmente. |
| RN-12 | No se permitirá registrar montos negativos ni iguales a cero. |

### 4.1. Representación monetaria

Los montos se almacenarán como números enteros, no como valores decimales de punto flotante. Esto evita problemas de precisión en operaciones monetarias expresadas en pesos colombianos.

Ejemplo:

```typescript
const gasto = {
  descripcion: 'Almuerzo',
  monto: 18000,
  categoria: 'Alimentación'
};
```

La presentación podrá utilizar el formato `$18.000`.

## 5. Tecnologías y herramientas

### 5.1. Tecnologías principales

| Tecnología | Uso |
|---|---|
| Angular 20 o versión estable compatible | Construcción de la interfaz y estructura de la aplicación |
| TypeScript | Modelos, servicios, validaciones, cálculos y lógica |
| SCSS | Organización de estilos y adaptación a pantallas de iPhone |
| IndexedDB | Almacenamiento local de los gastos |
| PWA | Instalación desde Safari y experiencia de aplicación web |
| `idb` | API simplificada para trabajar con IndexedDB |

Se utilizarán componentes standalone y las prácticas modernas de Angular.

### 5.2. Herramientas de desarrollo

| Herramienta | Utilidad |
|---|---|
| Visual Studio Code | Editor de código |
| Node.js | Entorno necesario para las herramientas de desarrollo |
| npm | Instalación y administración de dependencias |
| Angular CLI | Creación y administración del proyecto |
| Chrome o Edge | Pruebas y depuración durante el desarrollo |
| Safari en iPhone | Pruebas de instalación y funcionamiento real |
| Git | Control de versiones |
| GitHub | Repositorio del código fuente |
| GitHub Pages u otro hosting estático HTTPS | Alojamiento de los archivos de la PWA |

### 5.3. Herramientas que no se necesitan inicialmente

No se requiere incorporar:

- PostgreSQL.
- MySQL.
- MongoDB.
- Express o NestJS.
- Firebase.
- Autenticación de usuarios.
- Servidor backend.
- Cuenta de desarrollador de Apple.

La aplicación será personal y local, por lo que esa infraestructura no aporta valor suficiente en la primera versión.

## 6. Arquitectura del sistema

La arquitectura será **frontend modular**, organizada por responsabilidades. No se utilizará una arquitectura cliente-servidor tradicional porque no se necesita un backend.

### 6.1. Arquitectura lógica

```text
┌──────────────────────────────────────┐
│                Usuario               │
│              iPhone / iOS            │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│          Interfaz de usuario          │
│                Angular               │
│       Pantallas, formularios, rutas   │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│             Capa de lógica           │
│               Servicios              │
│  Validaciones, cálculos y operaciones│
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│              Persistencia            │
│               IndexedDB              │
│        Almacenamiento de gastos      │
└──────────────────────────────────────┘
```

Flujo general:

1. El usuario registra un gasto.
2. Angular recibe los datos del formulario.
3. El servicio valida la información.
4. El servicio guarda el registro en IndexedDB.
5. La aplicación actualiza el historial y los resúmenes.
6. El usuario puede consultar la información después de cerrar y volver a abrir la aplicación.

Las operaciones de consulta, edición y eliminación siguen el mismo flujo entre la interfaz, los servicios y IndexedDB.

### 6.2. Estructura de carpetas propuesta

```text
mi-bolsillo/
│
├── public/
│   ├── favicon.ico
│   └── icons/
│
├── src/
│   ├── app/
│   │   │
│   │   ├── core/
│   │   │   ├── models/
│   │   │   │   ├── gasto.model.ts
│   │   │   │   └── categoria.model.ts
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── gasto.service.ts
│   │   │   │   ├── almacenamiento.service.ts
│   │   │   │   └── estadisticas.service.ts
│   │   │   │
│   │   │   └── database/
│   │   │       └── database.config.ts
│   │   │
│   │   ├── features/
│   │   │   ├── inicio/
│   │   │   ├── registro/
│   │   │   ├── historial/
│   │   │   └── estadisticas/
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   └── pipes/
│   │   │
│   │   ├── app.routes.ts
│   │   ├── app.config.ts
│   │   └── app.ts
│   │
│   ├── styles.scss
│   ├── index.html
│   └── manifest.webmanifest
│
├── angular.json
├── package.json
└── tsconfig.json
```

### 6.3. Responsabilidades de los módulos

| Módulo | Responsabilidad |
|---|---|
| `models` | Definir estructuras y tipos de datos |
| `services` | Ejecutar operaciones y lógica de negocio |
| `database` | Configurar IndexedDB |
| `inicio` | Mostrar el resumen de gastos |
| `registro` | Crear nuevos gastos |
| `historial` | Consultar, editar y eliminar movimientos |
| `estadisticas` | Generar cálculos y gráficos |
| `shared` | Reutilizar componentes y elementos comunes |

La separación permite ampliar el proyecto sin tener que modificar toda la aplicación.

## 7. Diseño de la base de datos

La base de datos será IndexedDB, una tecnología de almacenamiento integrada en los navegadores. No se utilizará PostgreSQL ni MySQL.

**Nombre de la base de datos:** `MiBolsilloDB`

### 7.1. Almacén de gastos

Se creará un almacén de objetos llamado `gastos`.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Number | Identificador autoincremental |
| `descripcion` | String | Concepto del gasto |
| `monto` | Number | Valor en COP |
| `categoria` | String | Categoría asignada |
| `fecha` | String | Fecha del gasto, en formato `YYYY-MM-DD` |
| `creadoEn` | String | Fecha y hora de creación |

La propiedad `id` será la clave primaria (`keyPath`).

No se necesita una tabla de usuarios porque la aplicación no tendrá autenticación. Tampoco se necesita una tabla independiente para categorías en esta primera versión: se definirán mediante tipos y constantes en TypeScript.

### 7.2. Ejemplo de registros

```json
[
  {
    "id": 1,
    "descripcion": "Almuerzo",
    "monto": 18000,
    "categoria": "Alimentación",
    "fecha": "2026-10-30",
    "creadoEn": "2026-10-30T12:30:00"
  },
  {
    "id": 2,
    "descripcion": "Transporte",
    "monto": 12000,
    "categoria": "Transporte",
    "fecha": "2026-10-30",
    "creadoEn": "2026-10-30T13:00:00"
  }
]
```

Los valores son ilustrativos.

**Decisión importante:** se almacenará la fecha del gasto separada de la fecha y hora de creación. Así se podrá registrar hoy un gasto realizado ayer sin alterar el momento real en que se introdujo en la aplicación.

Se utilizarán fechas locales del iPhone de forma consistente para evitar errores de zona horaria al calcular los períodos.

## 8. Funcionamiento de los cálculos

Los totales diarios, semanales y mensuales no se almacenarán como datos independientes. Se calcularán a partir de los gastos existentes. Así se evitan inconsistencias cuando un movimiento se edita o elimina.

### 8.1. Cálculo diario

\[
T_d = \sum_{i=1}^{n} G_i
\]

Donde:

- \(T_d\): total gastado en el día.
- \(G_i\): valor de cada gasto.
- \(n\): cantidad de gastos del día.

Se sumarán únicamente los registros cuya fecha coincida con el día seleccionado.

### 8.2. Cálculo semanal

\[
T_s = \sum_{i=1}^{n} G_i
\]

Se considerarán los gastos cuya fecha esté entre el lunes y el domingo de la semana seleccionada.

### 8.3. Cálculo mensual

\[
T_m = \sum_{i=1}^{n} G_i
\]

Se considerarán únicamente los registros correspondientes al mes y año seleccionados.

### 8.4. Cálculo por categoría

\[
T_c = \sum_{i=1}^{n} G_i
\]

Se sumarán los gastos que pertenezcan a una categoría determinada dentro del período consultado.

Ejemplo ilustrativo:

| Categoría | Total |
|---|---:|
| Alimentación | $180.000 |
| Transporte | $75.000 |
| Entretenimiento | $45.000 |
| Compras | $120.000 |
| Otros | $30.000 |

## 9. Requisitos del sistema

### 9.1. Requisitos funcionales

| Código | Requisito |
|---|---|
| RF-01 | Registrar un gasto. |
| RF-02 | Consultar todos los gastos. |
| RF-03 | Editar un gasto existente. |
| RF-04 | Eliminar un gasto. |
| RF-05 | Clasificar gastos por categorías. |
| RF-06 | Consultar el total diario. |
| RF-07 | Consultar el total semanal. |
| RF-08 | Consultar el total mensual. |
| RF-09 | Filtrar gastos por fecha. |
| RF-10 | Consultar estadísticas por categoría. |
| RF-11 | Comparar períodos de gastos. |

### 9.2. Requisitos no funcionales

| Código | Requisito |
|---|---|
| RNF-01 | La aplicación debe ser compatible con Safari en iOS. |
| RNF-02 | La interfaz debe adaptarse a pantallas de iPhone. |
| RNF-03 | Los datos deben persistir entre sesiones. |
| RNF-04 | El funcionamiento principal no debe depender de internet después de la instalación y carga inicial. |
| RNF-05 | Las operaciones de almacenamiento deben ser asíncronas. |
| RNF-06 | La aplicación debe ofrecer tiempos de respuesta adecuados. |
| RNF-07 | Los registros financieros no deben enviarse a servidores externos. |
| RNF-08 | La aplicación debe permitir su instalación desde la pantalla de inicio. |

## 10. Funcionamiento sin conexión y almacenamiento

La aplicación tendrá dos elementos independientes:

### A. Aplicación instalada (PWA)

El Service Worker almacenará en caché los recursos necesarios para que las pantallas y funcionalidades puedan cargarse sin conexión, una vez realizada correctamente la primera carga.

### B. Datos personales (IndexedDB)

IndexedDB almacenará los movimientos del usuario en el almacenamiento local del navegador.

Por tanto, el usuario podrá:

- Registrar gastos sin internet.
- Consultar los gastos sin internet.
- Modificar y eliminar registros sin internet.
- Calcular los totales sin conexión.

**Limitación:** el almacenamiento local no equivale a una copia de seguridad garantizada. Si se eliminan los datos del sitio o se cambia de dispositivo, los registros podrían perderse. iOS también puede gestionar el almacenamiento de los sitios web.

Por eso se recomienda incorporar en una versión posterior una opción para exportar los datos a JSON o CSV y poder recuperarlos si se cambia de iPhone o se necesita restaurarlos.

La exportación de datos será una funcionalidad futura, no un requisito para la primera versión.

El alojamiento web solo servirá para distribuir los archivos de la aplicación. Los registros personales permanecerán en IndexedDB y no se enviarán a GitHub Pages.

## 11. Seguridad y privacidad

Aunque la aplicación no manejará datos bancarios, sí contendrá información financiera personal. Se tomarán las siguientes precauciones:

1. No solicitar información bancaria.
2. No solicitar contraseñas.
3. No transmitir los registros a terceros.
4. No incorporar publicidad ni seguimiento de usuarios.
5. Mantener las operaciones de almacenamiento dentro del dispositivo.
6. Validar los datos antes de almacenarlos.
7. Evitar que la interfaz permita introducir valores inválidos.

**Nota:** IndexedDB no cifra automáticamente los datos. No debe considerarse un almacén cifrado ni equivalente a una bóveda de seguridad.

## 12. Despliegue e instalación en iPhone

El desarrollo se realizará en Windows y el dispositivo final será un iPhone.

Proceso previsto:

```text
┌────────────────────────────────────┐
│          Computador Windows        │
│  Visual Studio Code + Angular      │
└──────────────────┬─────────────────┘
                   ▼
┌────────────────────────────────────┐
│             Compilación            │
│       Archivos de producción       │
└──────────────────┬─────────────────┘
                   ▼
┌────────────────────────────────────┐
│          Alojamiento HTTPS         │
│   GitHub Pages u hosting estático  │
└──────────────────┬─────────────────┘
                   ▼
┌────────────────────────────────────┐
│            Safari iPhone           │
│       Acceso a la aplicación       │
└──────────────────┬─────────────────┘
                   ▼
┌────────────────────────────────────┐
│       Mi Bolsillo instalado        │
│  Pantalla de inicio + datos locales│
└────────────────────────────────────┘
```

No será necesario:

- Comprar un Mac.
- Utilizar Xcode.
- Comprar una membresía de Apple Developer.
- Publicar la aplicación en App Store.

La instalación se realizará desde Safari mediante la opción **Agregar a pantalla de inicio**.

Se deberá configurar correctamente el enrutamiento de Angular, el manifiesto PWA, la caché del Service Worker y la ruta base del alojamiento seleccionado.

## 13. Funcionalidades fuera del alcance inicial

Para evitar que el proyecto crezca innecesariamente, estas características no formarán parte de la primera versión:

| Funcionalidad | Estado |
|---|---|
| Registro e inicio de sesión | No incluido |
| Múltiples usuarios | No incluido |
| Sincronización entre dispositivos | No incluido |
| Presupuestos mensuales | No incluido |
| Ingresos y salarios | No incluido |
| Gestión de deudas | No incluido |
| Conexión con bancos | No incluido |
| Inteligencia artificial | No incluido |
| Notificaciones financieras | No incluido |
| Exportación y restauración | Para una futura versión |

La exportación y restauración de datos es una mejora especialmente importante debido a que la aplicación será exclusivamente local.

## 14. Metodología y fases de desarrollo

Se propone desarrollar el proyecto por fases, completando y probando cada una antes de continuar.

### Fase 1. Análisis y planificación

- Definición del propósito.
- Alcance funcional.
- Requisitos.
- Selección tecnológica.
- Arquitectura.

**Estado:** definición inicial establecida.

### Fase 2. Configuración del entorno

- Crear el proyecto Angular.
- Instalar dependencias.
- Configurar rutas.
- Configurar PWA.
- Preparar IndexedDB.

### Fase 3. Desarrollo del almacenamiento

- Crear modelos.
- Implementar el servicio de gastos.
- Desarrollar operaciones CRUD.
- Implementar validaciones.
- Probar persistencia.

### Fase 4. Desarrollo funcional

- Registro de gastos.
- Historial.
- Filtros.
- Cálculos diarios, semanales y mensuales.
- Estadísticas.

### Fase 5. Diseño e interfaz

- Estructura de navegación.
- Adaptación a iPhone.
- Componentes.
- Experiencia de usuario.

El diseño visual se abordará después de establecer y comprobar la lógica funcional.

### Fase 6. Pruebas

- Validación de operaciones.
- Pruebas de cálculos.
- Pruebas sin conexión.
- Pruebas en Safari.
- Pruebas de persistencia.

### Fase 7. Instalación

- Compilación.
- Alojamiento HTTPS.
- Instalación en iPhone.
- Verificación final.

## 15. Criterios de aceptación de la primera versión

La primera versión se considerará terminada cuando cumpla estas condiciones:

- [ ] Permitir registrar gastos correctamente.
- [ ] Guardar los gastos en IndexedDB.
- [ ] Mantener los registros después de cerrar la aplicación.
- [ ] Permitir editar y eliminar gastos.
- [ ] Calcular correctamente los totales diarios.
- [ ] Calcular correctamente los totales semanales.
- [ ] Calcular correctamente los totales mensuales.
- [ ] Permitir consultar períodos anteriores.
- [ ] Mostrar estadísticas por categoría.
- [ ] Funcionar sin conexión después de la instalación y carga inicial.
- [ ] Poder instalarse en un iPhone desde Safari.

## 16. Resumen técnico definitivo

| Elemento | Selección |
|---|---|
| Nombre | Mi Bolsillo |
| Tipo de aplicación | PWA |
| Framework | Angular |
| Lenguaje | TypeScript |
| Estilos | SCSS |
| Arquitectura | Frontend modular |
| Componentes | Standalone |
| Base de datos | IndexedDB |
| Biblioteca de base de datos | `idb` |
| Moneda | COP |
| Persistencia | Local |
| Backend | Ninguno |
| Control de versiones | Git |
| Repositorio | GitHub |
| Alojamiento | GitHub Pages u otro hosting estático HTTPS |
| Dispositivo final | iPhone |
| Entorno de desarrollo | Windows |
| Publicación | No requiere App Store |

## 17. Decisiones técnicas fundamentales

Durante la primera versión se mantendrán estas decisiones:

1. **Separar la lógica de negocio de la interfaz.** Los cálculos y operaciones de datos estarán en servicios, no dispersos en los componentes visuales.
2. **Calcular los totales desde los registros reales.** No se guardarán acumulados independientes que puedan quedar desactualizados.
3. **Preparar el almacenamiento para futuras copias de seguridad.** La estructura deberá permitir agregar exportación y restauración sin rehacer el modelo de datos.
4. **Mantener la aplicación local y privada.** No se incorporará un backend ni sincronización en la nube en esta primera versión.
5. **Priorizar la funcionalidad antes del diseño visual.** Primero se implementarán y probarán las operaciones principales; después se trabajará en la apariencia.

---

## 18. Próximo paso

El siguiente paso técnico será configurar el entorno de desarrollo y crear el proyecto Angular.

Orden recomendado:

1. Verificar Node.js, npm y Angular CLI.
2. Crear el proyecto `mi-bolsillo`.
3. Instalar `idb`.
4. Configurar la PWA.
5. Crear los modelos de datos.
6. Configurar IndexedDB.
7. Implementar y probar las operaciones de registro, consulta, edición y eliminación.

**Este documento constituye la definición inicial de alcance, requisitos, arquitectura y tecnologías de Mi Bolsillo.** Cualquier ampliación futura deberá evaluarse para evitar incorporar complejidad innecesaria a la primera versión.
