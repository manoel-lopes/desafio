import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { FUEL_TYPES, type FuelType, type Vehicle } from '../data/vehicle.model';
import {
  createVehicleSchema,
  updateVehicleSchema,
  type CreateVehicleFormData,
  type UpdateVehicleFormData,
} from '../data/vehicle.schemas';
import { ApiError, VehiclesService } from '../data/vehicles.service';
import { toastError, toastSuccess } from '../../../core/toast';

@Component({
  selector: 'app-vehicle-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    ...HlmDialogImports,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmLabelImports,
  ],
  template: `
    <hlm-dialog [state]="open() ? 'open' : 'closed'" (stateChanged)="onStateChanged($event)">
      <hlm-dialog-content *hlmDialogPortal class="sm:max-w-[500px]">
        <hlm-dialog-header>
          <h2 hlmDialogTitle>{{ mode() === 'create' ? 'Novo Veículo' : 'Editar Veículo' }}</h2>
          <p hlmDialogDescription>
            {{
              mode() === 'create'
                ? 'Preencha os dados para cadastrar um novo veículo.'
                : 'Atualize os dados do veículo.'
            }}
          </p>
        </hlm-dialog-header>

        <form class="space-y-4" [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <label hlmLabel for="vf-plate">Placa</label>
              <input hlmInput id="vf-plate" class="uppercase" formControlName="plate" placeholder="ABC1D23" />
              @if (form.controls.plate.touched && form.controls.plate.errors?.['msg']) {
                <p class="text-destructive text-sm">{{ form.controls.plate.errors?.['msg'] }}</p>
              }
            </div>
            <div class="space-y-2">
              <label hlmLabel for="vf-ano">Ano</label>
              <input
                hlmInput
                id="vf-ano"
                type="number"
                formControlName="ano"
                [attr.placeholder]="'' + currentYear"
              />
              @if (form.controls.ano.touched && form.controls.ano.errors?.['msg']) {
                <p class="text-destructive text-sm">{{ form.controls.ano.errors?.['msg'] }}</p>
              }
            </div>
            <div class="space-y-2">
              <label hlmLabel for="vf-marca">Marca</label>
              <input hlmInput id="vf-marca" formControlName="marca" placeholder="Volkswagen" />
              @if (form.controls.marca.touched && form.controls.marca.errors?.['msg']) {
                <p class="text-destructive text-sm">{{ form.controls.marca.errors?.['msg'] }}</p>
              }
            </div>
            <div class="space-y-2">
              <label hlmLabel for="vf-modelo">Modelo</label>
              <input hlmInput id="vf-modelo" formControlName="modelo" placeholder="Gol" />
              @if (form.controls.modelo.touched && form.controls.modelo.errors?.['msg']) {
                <p class="text-destructive text-sm">{{ form.controls.modelo.errors?.['msg'] }}</p>
              }
            </div>
            <div class="space-y-2 sm:col-span-2">
              <label hlmLabel for="vf-chassi">Chassi</label>
              <input
                hlmInput
                id="vf-chassi"
                class="uppercase"
                formControlName="chassi"
                placeholder="9BWZZZ377VT004251"
              />
              @if (form.controls.chassi.touched && form.controls.chassi.errors?.['msg']) {
                <p class="text-destructive text-sm">{{ form.controls.chassi.errors?.['msg'] }}</p>
              }
            </div>
            <div class="space-y-2 sm:col-span-2">
              <label hlmLabel for="vf-renavam">Renavam</label>
              <input hlmInput id="vf-renavam" formControlName="renavam" placeholder="12345678901" />
              @if (form.controls.renavam.touched && form.controls.renavam.errors?.['msg']) {
                <p class="text-destructive text-sm">{{ form.controls.renavam.errors?.['msg'] }}</p>
              }
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <button hlmBtn type="button" variant="outline" [disabled]="isSubmitting()" hlmDialogClose>
              Cancelar
            </button>
            <button hlmBtn type="submit" [disabled]="isSubmitting()">
              @if (isSubmitting()) {
                <lucide-icon name="loader-circle" class="mr-2 size-4 animate-spin" />
              }
              {{ mode() === 'create' ? 'Cadastrar' : 'Salvar' }}
            </button>
          </div>
        </form>
      </hlm-dialog-content>
    </hlm-dialog>
  `,
})
export class VehicleFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly vehiclesService = inject(VehiclesService);

  readonly currentYear = new Date().getFullYear();
  readonly open = input(false);
  readonly openChange = output<boolean>();
  readonly mode = input.required<'create' | 'edit'>();
  readonly vehicle = input<Vehicle | null>(null);

  readonly saved = output<void>();

  protected readonly isSubmitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    plate: ['', Validators.required],
    chassi: ['', Validators.required],
    renavam: ['', Validators.required],
    modelo: ['', Validators.required],
    marca: ['', Validators.required],
    ano: [this.currentYear, Validators.required],
    fuel: [FUEL_TYPES[0] as FuelType, Validators.required],
  });

  constructor() {
    effect(() => {
      const isOpen = this.open();
      const v = this.vehicle();
      const m = this.mode();
      if (!isOpen) return;
      untracked(() => {
        if (m === 'edit' && v) {
          this.form.reset({
            plate: v.plate,
            chassi: v.chassi,
            renavam: v.renavam,
            modelo: v.modelo,
            marca: v.marca,
            ano: v.ano,
            fuel: v.fuel,
          });
        } else if (m === 'create') {
          this.form.reset({
            plate: '',
            chassi: '',
            renavam: '',
            modelo: '',
            marca: '',
            ano: this.currentYear,
            fuel: FUEL_TYPES[0] as FuelType,
          });
        }
        this.form.markAsPristine();
      });
    });
  }

  protected onStateChanged(state: 'open' | 'closed'): void {
    if (state === 'closed') {
      this.openChange.emit(false);
    }
  }

  private setFieldError(field: keyof CreateVehicleFormData, message: string): void {
    const c = this.form.get(field as string);
    c?.setErrors({ msg: message });
    c?.markAsTouched();
  }

  private clearFieldErrors(): void {
    for (const k of ['plate', 'chassi', 'renavam', 'modelo', 'marca', 'ano', 'fuel'] as const) {
      const c = this.form.get(k);
      if (c?.errors?.['msg']) {
        c.setErrors(null);
      }
    }
  }

  async onSubmit(): Promise<void> {
    this.clearFieldErrors();
    const raw = this.form.getRawValue();

    if (this.mode() === 'create') {
      const parsed = createVehicleSchema.safeParse(raw);
      if (!parsed.success) {
        for (const iss of parsed.error.issues) {
          const path = iss.path[0];
          if (typeof path === 'string') {
            this.setFieldError(path as keyof CreateVehicleFormData, iss.message);
          }
        }
        return;
      }
      this.isSubmitting.set(true);
      try {
        await this.vehiclesService.create(parsed.data);
        toastSuccess('Veículo cadastrado com sucesso');
        this.openChange.emit(false);
        this.saved.emit();
      } catch (e) {
        this.handleApiError(e);
      } finally {
        this.isSubmitting.set(false);
      }
      return;
    }

    const v = this.vehicle();
    if (!v) return;

    const dirty = this.form.dirty;
    if (!dirty) {
      this.openChange.emit(false);
      return;
    }

    const patch: UpdateVehicleFormData = {};
    if (this.form.controls.plate.dirty) patch.plate = raw.plate;
    if (this.form.controls.chassi.dirty) patch.chassi = raw.chassi;
    if (this.form.controls.renavam.dirty) patch.renavam = raw.renavam;
    if (this.form.controls.modelo.dirty) patch.modelo = raw.modelo;
    if (this.form.controls.marca.dirty) patch.marca = raw.marca;
    if (this.form.controls.ano.dirty) patch.ano = raw.ano;
    if (this.form.controls.fuel.dirty) patch.fuel = raw.fuel;

    const parsed = updateVehicleSchema.safeParse(patch);
    if (!parsed.success) {
      for (const iss of parsed.error.issues) {
        const path = iss.path[0];
        if (typeof path === 'string') {
          this.setFieldError(path as keyof CreateVehicleFormData, iss.message);
        }
      }
      return;
    }

    this.isSubmitting.set(true);
    try {
      await this.vehiclesService.update(v.id, parsed.data);
      toastSuccess('Veículo atualizado com sucesso');
      this.openChange.emit(false);
      this.saved.emit();
    } catch (e) {
      this.handleApiError(e);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private handleApiError(e: unknown): void {
    if (e instanceof ApiError) {
      if (e.status === 409) {
        toastError('Já existe um veículo com esta placa, chassi ou renavam');
      } else {
        toastError(e.message);
      }
    } else {
      toastError('Erro ao salvar veículo');
    }
  }
}
