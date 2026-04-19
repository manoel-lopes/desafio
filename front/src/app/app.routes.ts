import { Routes } from '@angular/router';
import { vehiclesListResolver } from './features/vehicles/resolvers/vehicles-list.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/vehicles/pages/home.page').then((m) => m.HomePage),
    title: 'Dashboard de Veículos',
  },
  {
    path: 'vehicles',
    loadComponent: () =>
      import('./features/vehicles/pages/vehicles-list.page').then((m) => m.VehiclesListPage),
    resolve: { initial: vehiclesListResolver },
    runGuardsAndResolvers: 'always',
    title: 'Veículos',
  },
  {
    path: 'vehicles/:id',
    loadComponent: () =>
      import('./features/vehicles/pages/vehicle-detail.page').then((m) => m.VehicleDetailPage),
    title: 'Detalhe do veículo',
  },
];
