import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'registro' },
  {
    path: 'registro',
    loadComponent: () => import('./features/mascotas/registro-mascota.component').then(m => m.RegistroMascotaComponent)
  },
  {
    path: 'citas',
    loadComponent: () => import('./features/citas/agenda-citas.component').then(m => m.AgendaCitasComponent)
  },
  {
    path: 'historial',
    loadComponent: () => import('./features/historial/historial.component').then(m => m.HistorialComponent)
  },
  { path: '**', redirectTo: 'registro' }
];
