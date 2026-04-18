import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { ApiError, VehiclesService } from '../data/vehicles.service';
import { toastError, toastSuccess } from '../../../core/toast';

@Component({
  selector: 'app-delete-vehicle-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, ...HlmAlertDialogImports, ...HlmButtonImports],
  template: `
    <hlm-alert-dialog
      [state]="open() ? 'open' : 'closed'"
      (stateChanged)="onStateChanged($event)"
    >
      <hlm-alert-dialog-content *hlmAlertDialogPortal>
        <hlm-alert-dialog-header>
          <h2 hlmAlertDialogTitle>Excluir veículo</h2>
          <p hlmAlertDialogDescription>
            Tem certeza que deseja excluir o veículo com placa
            <strong>{{ vehiclePlate() }}</strong
            >? Esta ação não pode ser desfeita.
          </p>
        </hlm-alert-dialog-header>
        <hlm-alert-dialog-footer class="flex gap-2">
          <button hlmAlertDialogCancel hlmBtn type="button" variant="outline" [disabled]="isDeleting()">
            Cancelar
          </button>
          <button
            hlmAlertDialogAction
            hlmBtn
            type="button"
            variant="destructive"
            [disabled]="isDeleting()"
            (click)="onConfirm()"
          >
            @if (isDeleting()) {
              <lucide-icon name="loader-circle" class="mr-2 size-4 animate-spin" />
            }
            Excluir
          </button>
        </hlm-alert-dialog-footer>
      </hlm-alert-dialog-content>
    </hlm-alert-dialog>
  `,
})
export class DeleteVehicleDialog {
  private readonly vehiclesService = inject(VehiclesService);

  readonly open = input(false);
  readonly openChange = output<boolean>();
  readonly vehicleId = input<string | null>(null);
  readonly vehiclePlate = input('');

  readonly deleted = output<void>();

  protected readonly isDeleting = signal(false);

  protected onStateChanged(state: 'open' | 'closed'): void {
    if (state === 'closed') {
      this.openChange.emit(false);
    }
  }

  async onConfirm(): Promise<void> {
    const id = this.vehicleId();
    if (!id) return;
    this.isDeleting.set(true);
    try {
      await this.vehiclesService.remove(id);
      toastSuccess('Veículo excluído com sucesso');
      this.openChange.emit(false);
      this.deleted.emit();
    } catch (e) {
      if (e instanceof ApiError) {
        toastError(e.message);
      } else {
        toastError('Erro ao excluir veículo');
      }
    } finally {
      this.isDeleting.set(false);
    }
  }
}
