import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { VehiclesService } from '../data/vehicles.service';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule, ...HlmButtonImports, ...HlmSkeletonImports],
  template: `
    <div class="flex flex-col gap-8">
      <div
        class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 text-white dark:from-zinc-800 dark:to-zinc-900"
      >
        <div class="absolute -right-12 -top-12 size-64 rounded-full bg-white/5 blur-3xl"></div>
        <div class="absolute -bottom-16 -left-16 size-48 rounded-full bg-white/5 blur-3xl"></div>

        <div class="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-zinc-400">
              <lucide-icon name="gauge" class="size-4" />
              <span class="text-sm font-medium uppercase tracking-wider">Dashboard</span>
            </div>
            <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Gerenciamento de Veiculos</h1>
            <p class="max-w-md text-zinc-400">Controle completo da sua frota em um so lugar.</p>
          </div>

          <a hlmBtn size="lg" class="w-fit bg-white text-zinc-900 hover:bg-zinc-100" routerLink="/vehicles">
            Ver todos os veiculos
            <lucide-icon name="arrow-right" class="ml-2 size-4" />
          </a>
        </div>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          class="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-lg"
        >
          <div
            class="bg-primary/5 absolute -right-8 -top-8 size-32 rounded-full transition-transform group-hover:scale-110"
          ></div>
          <div class="relative">
            <div class="bg-primary/10 mb-4 flex size-12 items-center justify-center rounded-xl">
              <lucide-icon name="car" class="text-primary size-6" />
            </div>
            <p class="text-sm font-medium text-muted-foreground">Total de Veiculos</p>
            @if (isLoading()) {
              <span hlmSkeleton class="mt-2 h-10 w-20"></span>
            } @else {
              <p class="mt-1 text-4xl font-bold tracking-tight">{{ stats().total }}</p>
            }
            <p class="mt-2 text-sm text-muted-foreground">cadastrados no sistema</p>
          </div>
        </div>

        <div class="rounded-2xl border border-border bg-card p-6 sm:col-span-1 lg:col-span-2">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold">Veiculos Recentes</h2>
            <a
              hlmBtn
              variant="ghost"
              size="sm"
              class="text-muted-foreground hover:text-foreground"
              routerLink="/vehicles"
            >
              Ver todos
              <lucide-icon name="arrow-right" class="ml-1 size-4" />
            </a>
          </div>

          @if (isLoading()) {
            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              @for (item of [1, 2, 3]; track item) {
                <div class="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                  <span hlmSkeleton class="size-10 rounded-lg"></span>
                  <div class="flex-1 space-y-1.5">
                    <span hlmSkeleton class="h-4 w-24"></span>
                    <span hlmSkeleton class="h-3 w-16"></span>
                  </div>
                </div>
              }
            </div>
          } @else if (stats().recentVehicles.length === 0) {
            <div class="flex flex-col items-center justify-center rounded-xl bg-muted/30 py-12">
              <div class="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                <lucide-icon name="car" class="size-6 text-muted-foreground" />
              </div>
              <p class="text-sm text-muted-foreground">Nenhum veiculo cadastrado</p>
              <a hlmBtn variant="link" size="sm" class="mt-2" routerLink="/vehicles"
                >Cadastrar primeiro veiculo</a
              >
            </div>
          } @else {
            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              @for (vehicle of stats().recentVehicles.slice(0, 6); track vehicle.id) {
                <a
                  class="group/item flex items-center gap-3 rounded-xl bg-muted/30 p-3 transition-all hover:bg-muted/60"
                  [routerLink]="['/vehicles', vehicle.id]"
                >
                  <div
                    class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm"
                  >
                    <lucide-icon
                      name="car"
                      class="size-5 text-muted-foreground transition-colors group-hover/item:text-foreground"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium">{{ vehicle.marca }} {{ vehicle.modelo }}</p>
                    <p class="truncate text-xs text-muted-foreground">
                      {{ vehicle.ano }} - {{ vehicle.plate }}
                    </p>
                  </div>
                </a>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class HomePage {
  private readonly vehiclesService = inject(VehiclesService);

  readonly stats = signal({ total: 0, recentVehicles: [] as Awaited<ReturnType<VehiclesService['list']>>['items'] });
  readonly isLoading = signal(true);

  constructor() {
    void this.loadStats();
  }

  private async loadStats(): Promise<void> {
    this.isLoading.set(true);
    try {
      const result = await this.vehiclesService.list({ pageSize: 5 });
      this.stats.set({
        total: result.totalItems,
        recentVehicles: result.items,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      this.stats.set({ total: 0, recentVehicles: [] });
    } finally {
      this.isLoading.set(false);
    }
  }
}
