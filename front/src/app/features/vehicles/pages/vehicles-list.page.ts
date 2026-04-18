import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map, skip, tap } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import type { ListResult, Vehicle } from '../data/vehicle.model';
import { DeleteVehicleDialog } from '../ui/delete-vehicle-dialog';
import { PaginationBar } from '../ui/pagination-bar';
import { VehicleFormDialog } from '../ui/vehicle-form-dialog';
import { VehiclesTable } from '../ui/vehicles-table';

const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'] as const;
const ORDER_OPTIONS = [
  { value: 'desc', label: 'Mais recentes' },
  { value: 'asc', label: 'Mais antigos' },
] as const;

@Component({
  selector: 'app-vehicles-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    ...HlmButtonImports,
    ...HlmEmptyImports,
    ...HlmSelectImports,
    VehiclesTable,
    PaginationBar,
    VehicleFormDialog,
    DeleteVehicleDialog,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Veículos</h1>
          <p class="text-muted-foreground">Gerencie os veículos cadastrados no sistema</p>
        </div>
        <button hlmBtn type="button" (click)="openCreate()">
          <lucide-icon name="plus-circle" class="mr-2 size-4" />
          Novo veículo
        </button>
      </div>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground">Exibir</span>
          <hlm-select
            [value]="'' + pageSize()"
            (valueChange)="onPageSizeChange($any($event))"
          >
            <hlm-select-trigger class="w-[80px]">
              <hlm-select-value />
            </hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal>
              @for (size of pageSizeOptions; track size) {
                <hlm-select-item [value]="size">{{ size }}</hlm-select-item>
              }
            </hlm-select-content>
          </hlm-select>
          <span class="text-sm text-muted-foreground">por página</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground">Ordenar por</span>
          <hlm-select
            [value]="order()"
            (valueChange)="onOrderChange($any($event))"
          >
            <hlm-select-trigger class="w-[150px]">
              <hlm-select-value />
            </hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal>
              @for (opt of orderOptions; track opt.value) {
                <hlm-select-item [value]="opt.value">{{ opt.label }}</hlm-select-item>
              }
            </hlm-select-content>
          </hlm-select>
        </div>
      </div>

      @if (!isReloading() && data().items.length === 0) {
        <div hlmEmpty>
          <div hlmEmptyHeader>
            <div hlmEmptyMedia variant="icon">
              <lucide-icon name="car" class="size-6" />
            </div>
            <div hlmEmptyTitle>Nenhum veículo cadastrado</div>
            <div hlmEmptyDescription>Comece cadastrando o primeiro veículo no sistema.</div>
          </div>
          <div hlmEmptyContent>
            <button hlmBtn type="button" (click)="openCreate()">
              <lucide-icon name="plus-circle" class="mr-2 size-4" />
              Cadastrar primeiro veículo
            </button>
          </div>
        </div>
      } @else {
        <app-vehicles-table
          [vehicles]="data().items"
          [isLoading]="isReloading()"
          (edit)="openEdit($event)"
          (remove)="vehicleToDelete.set($event)"
        />

        @if (data(); as d) {
          @if (d.totalItems > 0) {
            <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p class="text-sm text-muted-foreground">
                Mostrando {{ startIndex() }}–{{ endIndex() }} de {{ d.totalItems }} veículos
              </p>
              <app-pagination-bar [currentPage]="d.page" [totalPages]="d.totalPages" />
            </div>
          }
        }
      }

      @defer (when formOpen()) {
        <app-vehicle-form-dialog
          [open]="formOpen()"
          (openChange)="formOpen.set($event)"
          [mode]="formMode()"
          [vehicle]="vehicleToEdit()"
          (saved)="onSaved()"
        />
      }

      <app-delete-vehicle-dialog
        [open]="!!vehicleToDelete()"
        (openChange)="onDeleteOpenChange($event)"
        [vehicleId]="vehicleToDelete()?.id ?? null"
        [vehiclePlate]="vehicleToDelete()?.plate ?? ''"
        (deleted)="onSaved()"
      />
    </div>
  `,
})
export class VehiclesListPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  readonly orderOptions = ORDER_OPTIONS;

  readonly isReloading = signal(false);

  readonly data = toSignal(
    this.route.data.pipe(
      map((d) => d['initial'] as ListResult),
      tap(() => this.isReloading.set(false)),
    ),
    { initialValue: this.route.snapshot.data['initial'] as ListResult },
  );

  constructor() {
    this.route.queryParamMap
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.isReloading.set(true));
  }

  readonly formOpen = signal(false);
  readonly formMode = signal<'create' | 'edit'>('create');
  readonly vehicleToEdit = signal<Vehicle | null>(null);
  readonly vehicleToDelete = signal<Vehicle | null>(null);

  readonly pageSize = toSignal(
    this.route.queryParamMap.pipe(
      map((q) => Number(q.get('pageSize')) || 20),
    ),
    { initialValue: Number(this.route.snapshot.queryParamMap.get('pageSize')) || 20 },
  );

  readonly order = toSignal(
    this.route.queryParamMap.pipe(
      map((q) => (q.get('order') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'),
    ),
    {
      initialValue:
        this.route.snapshot.queryParamMap.get('order') === 'asc' ? 'asc' : 'desc',
    },
  );

  startIndex(): number {
    const d = this.data();
    if (!d) return 0;
    return (d.page - 1) * d.pageSize + 1;
  }

  endIndex(): number {
    const d = this.data();
    if (!d) return 0;
    return Math.min(d.page * d.pageSize, d.totalItems);
  }

  openCreate(): void {
    this.formMode.set('create');
    this.vehicleToEdit.set(null);
    this.formOpen.set(true);
  }

  openEdit(v: Vehicle): void {
    this.formMode.set('edit');
    this.vehicleToEdit.set(v);
    this.formOpen.set(true);
  }

  onPageSizeChange(value: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pageSize: value, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  onOrderChange(value: 'asc' | 'desc'): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { order: value },
      queryParamsHandling: 'merge',
    });
  }

  async onSaved(): Promise<void> {
    await this.router.navigateByUrl(this.router.url);
  }

  onDeleteOpenChange(open: boolean): void {
    if (!open) {
      this.vehicleToDelete.set(null);
    }
  }
}
