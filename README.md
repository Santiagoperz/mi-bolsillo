# Mi Bolsillo

Aplicación personal para registrar y consultar gastos cotidianos en pesos colombianos (COP). Se instala como PWA en iPhone y guarda los datos localmente en el dispositivo, sin backend.

## Estado

En desarrollo. El alcance del MVP está en [docs/mi-bolsillo-definicion-proyecto.md](docs/mi-bolsillo-definicion-proyecto.md) y el trabajo se sigue en los [issues](https://github.com/Santiagoperz/mi-bolsillo/issues).

## Tecnologías

- Angular 22 (componentes standalone), TypeScript 6 y SCSS
- Vitest para pruebas unitarias
- Previsto: IndexedDB con `idb` para el almacenamiento local y PWA para la instalación en iPhone

## Requisitos

- Node.js compatible con Angular 22 (se desarrolla con Node 24) y npm

## Comandos

```bash
npm install     # instalar dependencias
npm start       # servidor de desarrollo en http://localhost:4200
npm test        # pruebas unitarias
npm run build   # compilación de producción en dist/
```