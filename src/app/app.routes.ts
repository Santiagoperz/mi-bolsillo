import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  {
    path: 'inicio',
    loadComponent: () => import('./features/inicio/inicio').then((m) => m.Inicio),
  },
  {
    path: 'registro',
    loadComponent: () => import('./features/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'historial',
    loadComponent: () => import('./features/historial/historial').then((m) => m.Historial),
  },
  {
    path: 'historial/:id',
    loadComponent: () =>
      import('./features/historial/detalle/detalle-gasto').then((m) => m.DetalleGasto),
  },
  {
    path: 'estadisticas',
    loadComponent: () =>
      import('./features/estadisticas/estadisticas').then((m) => m.Estadisticas),
  },
  { path: '**', redirectTo: 'inicio' },
];