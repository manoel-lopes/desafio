import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { Title } from '@angular/platform-browser';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import type { Vehicle } from '../data/vehicle.model';
import { ApiError, VehiclesService } from '../data/vehicles.service';
import { DeleteVehicleDialog } from '../ui/delete-vehicle-dialog';
import { VehicleFormDialog } from '../ui/vehicle-form-dialog';
import { toastError } from '../../../core/toast';

@Component({
  selector: 'app-vehicle-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    LucideAngularModule,
    ...HlmBadgeImports,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmSeparatorImports,
    ...HlmSkeletonImports,
    VehicleFormDialog,
    DeleteVehicleDialog,
  ],
  template: `
    @if (isLoading()) {
      <div class="space-y-6">
        <div class="flex items-center gap-4">
          <span hlmSkeleton class="size-10"></span>
          <div class="space-y-2">
            <span hlmSkeleton class="h-8 w-48"></span>
            <span hlmSkeleton class="h-4 w-32"></span>
          </div>
        </div>
        <div hlmCard>
          <div hlmCardHeader>
            <span hlmSkeleton class="h-6 w-40"></span>
          </div>
          <div hlmCardContent class="space-y-4">
            @for (i of [1, 2, 3, 4, 5, 6]; track i) {
              <div class="flex justify-between">
                <span hlmSkeleton class="h-4 w-24"></span>
                <span hlmSkeleton class="h-4 w-32"></span>
              </div>
            }
          </div>
        </div>
      </div>
    } @else if (notFound()) {
      <div class="flex flex-col items-center justify-center py-12">
        <lucide-icon name="car" class="mb-4 size-16 text-muted-foreground" />
        <h1 class="mb-2 text-2xl font-bold">Veículo não encontrado</h1>
        <p class="mb-6 text-muted-foreground">
          O veículo que você está procurando não existe ou foi removido.
        </p>
        <a hlmBtn routerLink="/vehicles">
          <lucide-icon name="arrow-left" class="mr-2 size-4" />
          Voltar para lista
        </a>
      </div>
    } @else if (vehicle(); as v) {
      <div class="space-y-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <a hlmBtn variant="ghost" size="icon" routerLink="/vehicles" aria-label="Voltar">
              <lucide-icon name="arrow-left" class="size-4" />
              <span class="sr-only">Voltar</span>
            </a>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-3xl font-bold tracking-tight">{{ v.marca }} {{ v.modelo }}</h1>
                <div hlmBadge variant="secondary">{{ v.ano }}</div>
              </div>
              <p class="font-mono text-muted-foreground">{{ v.plate }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button hlmBtn type="button" variant="outline" (click)="formOpen.set(true)">
              <lucide-icon name="pencil" class="mr-2 size-4" />
              Editar
            </button>
            <button hlmBtn type="button" variant="destructive" (click)="showDelete.set(true)">
              <lucide-icon name="trash-2" class="mr-2 size-4" />
              Excluir
            </button>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <div hlmCard>
            <div hlmCardHeader>
              <div hlmCardTitle class="flex items-center gap-2">
                <lucide-icon name="car" class="size-5" />
                Dados do Veículo
              </div>
              <p hlmCardDescription>Informações principais do veículo</p>
            </div>
            <div hlmCardContent class="space-y-4">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Placa</span>
                <span class="font-mono font-medium">{{ v.plate }}</span>
              </div>
              <div hlmSeparator></div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Marca</span>
                <span class="font-medium">{{ v.marca }}</span>
              </div>
              <div hlmSeparator></div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Modelo</span>
                <span class="font-medium">{{ v.modelo }}</span>
              </div>
              <div hlmSeparator></div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Ano</span>
                <span class="font-medium">{{ v.ano }}</span>
              </div>
            </div>
          </div>

          <div hlmCard>
            <div hlmCardHeader>
              <div hlmCardTitle class="flex items-center gap-2">
                <lucide-icon name="hash" class="size-5" />
                Identificação
              </div>
              <p hlmCardDescription>Códigos únicos de identificação</p>
            </div>
            <div hlmCardContent class="space-y-4">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Chassi</span>
                <span class="font-mono text-sm font-medium">{{ v.chassi }}</span>
              </div>
              <div hlmSeparator></div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Renavam</span>
                <span class="font-mono text-sm font-medium">{{ v.renavam }}</span>
              </div>
            </div>
          </div>

          <div hlmCard class="lg:col-span-2">
            <div hlmCardHeader>
              <div hlmCardTitle class="flex items-center gap-2">
                <lucide-icon name="calendar" class="size-5" />
                Histórico
              </div>
              <p hlmCardDescription>Datas de criação e atualização do registro</p>
            </div>
            <div hlmCardContent class="space-y-4">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Criado em</span>
                <span class="font-medium">{{ formatDate(v.createdAt) }}</span>
              </div>
              <div hlmSeparator></div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Última atualização</span>
                <span class="font-medium">{{ formatDate(v.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      @if (formOpen()) {
        @defer {
          <app-vehicle-form-dialog
            [open]="formOpen()"
            (openChange)="formOpen.set($event)"
            mode="edit"
            [vehicle]="v"
            (saved)="reload()"
          />
        }
      }

      <app-delete-vehicle-dialog
        [open]="showDelete()"
        (openChange)="showDelete.set($event)"
        [vehicleId]="v.id"
        [vehiclePlate]="v.plate"
        (deleted)="afterDelete()"
      />
    }
  `,
})
export class VehicleDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly vehiclesService = inject(VehiclesService);
  readonly formOpen = signal(false);
  readonly showDelete = signal(false);

  readonly isLoading = signal(true);
  readonly notFound = signal(false);
  readonly vehicle = signal<Vehicle | null>(null);

  private readonly id = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('id'))),
    { initialValue: this.route.snapshot.paramMap.get('id') },
  );

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id) {
        untracked(() => {
          this.isLoading.set(false);
          this.notFound.set(true);
          this.vehicle.set(null);
          this.title.setTitle('Veículo não encontrado');
        });
        return;
      }
      untracked(() => void this.loadVehicle(id));
    });
  }

  private async loadVehicle(id: string): Promise<void> {
    this.isLoading.set(true);
    this.notFound.set(false);
    try {
      const data = await this.vehiclesService.getById(id);
      this.vehicle.set(data);
      this.title.setTitle(`${data.marca} ${data.modelo} · Veículos`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        this.notFound.set(true);
        this.vehicle.set(null);
        this.title.setTitle('Veículo não encontrado');
      } else {
        console.error('Failed to load vehicle:', e);
        toastError('Erro ao carregar veículo');
        this.vehicle.set(null);
        this.title.setTitle('Detalhe do veículo');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '—';
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(dateString));
  }

  async reload(): Promise<void> {
    const id = this.id();
    if (id) await this.loadVehicle(id);
    else await this.router.navigateByUrl(this.router.url);
  }

  afterDelete(): void {
    void this.router.navigate(['/vehicles']);
  }
}
