# Mi Bolsillo

[![CI](https://github.com/Santiagoperz/mi-bolsillo/actions/workflows/ci.yml/badge.svg)](https://github.com/Santiagoperz/mi-bolsillo/actions/workflows/ci.yml)

**App:** https://santiagoperz.github.io/mi-bolsillo/ (ábrela en Safari y usa "Agregar a pantalla de inicio")

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

## Actualizaciones

La app usa el Service Worker de Angular, que solo se registra en el build de producción. Cada vez que se despliega una versión nueva:

1. El Service Worker la descarga en segundo plano. Comprueba si hay versión nueva al abrir la app y, además, cada vez que la app vuelve a primer plano, porque en iPhone una app instalada rara vez se cierra del todo.
2. Cuando la versión nueva está lista, aparece un aviso con el botón **Actualizar**. La app no se recarga sola, para no interrumpir un registro a medias.
3. Al pulsar **Actualizar** se recarga la app con la versión nueva. Si no se pulsa, la versión nueva se aplica la próxima vez que la app arranque desde cero.
4. Si la caché del navegador queda dañada, la app se recarga automáticamente.

Los iconos se generan desde `scripts/iconos/` con `npm install --no-save sharp` y `node scripts/iconos/generar.mjs`.
```
## Despliegue

Cada push a `main` que pasa las pruebas se publica en GitHub Pages: el workflow compila con `npm run build:pages` (ruta base `/mi-bolsillo/`), copia `index.html` como `404.html` para que funcionen las rutas profundas y lo despliega con `actions/deploy-pages`. También se puede lanzar a mano desde la pestaña Actions.