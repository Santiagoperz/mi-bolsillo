import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  {
    path: 'inicio',
    title: 'Inicio · Mi Bolsillo',
    loadComponent: () => import('./features/inicio/inicio').then((m) => m.Inicio),
  },
  {
    path: 'registro',
    title: 'Registrar gasto · Mi Bolsillo',
    loadComponent: () => import('./features/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'historial',
    title: 'Historial · Mi Bolsillo',
    loadComponent: () => import('./features/historial/historial').then((m) => m.Historial),
  },
  {
    path: 'historial/:id',
    title: 'Detalle del gasto · Mi Bolsillo',
    loadComponent: () =>
      import('./features/historial/detalle/detalle-gasto').then((m) => m.DetalleGasto),
  },
  {
    path: 'estadisticas',
    title: 'Estadísticas · Mi Bolsillo',
    loadComponent: () =>
      import('./features/estadisticas/estadisticas').then((m) => m.Estadisticas),
  },
  {
    path: 'ajustes',
    title: 'Ajustes · Mi Bolsillo',
    loadComponent: () => import('./features/ajustes/ajustes').then((m) => m.Ajustes),
  },
  // Dirección anterior de la pantalla de ajustes (estuvo publicada brevemente).
  { path: 'datos', redirectTo: 'ajustes' },
  { path: '**', redirectTo: 'inicio' },
];