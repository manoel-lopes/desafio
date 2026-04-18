import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'vehicles', renderMode: RenderMode.Prerender },
  { path: 'vehicles/:id', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server },
];
