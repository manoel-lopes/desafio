import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import type { Vehicle } from '../data/vehicle.model';

@Component({
  selector: 'app-vehicles-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    LucideAngularModule,
    ...HlmButtonImports,
    ...HlmDropdownMenuImports,
    ...HlmSkeletonImports,
  ],
  template: `
    <div class="rounded-md border">
      @if (isLoading()) {
        <table class="w-full caption-bottom text-sm">
          <thead class="[&>tr]:border-b">
            <tr class="hover:bg-muted/50 border-b transition-colors">
              <th class="text-foreground h-10 px-2 text-left align-middle font-medium">Placa</th>
              <th class="text-foreground h-10 px-2 text-left align-middle font-medium">Marca</th>
              <th class="text-foreground h-10 px-2 text-left align-middle font-medium">Modelo</th>
              <th class="text-foreground hidden h-10 px-2 text-left align-middle font-medium sm:table-cell">
                Ano
              </th>
              <th class="text-foreground hidden h-10 px-2 text-left align-middle font-medium md:table-cell">
                Chassi
              </th>
              <th class="text-foreground hidden h-10 px-2 text-left align-middle font-medium lg:table-cell">
                Renavam
              </th>
              <th class="text-foreground hidden h-10 px-2 text-left align-middle font-medium xl:table-cell">
                Criado em
              </th>
              <th class="h-10 w-[70px] px-2 text-left align-middle font-medium">Ações</th>
            </tr>
          </thead>
          <tbody class="[&>tr:last-child]:border-0">
            @for (i of [1, 2, 3, 4, 5]; track i) {
              <tr class="hover:bg-muted/50 border-b transition-colors">
                <td class="p-2 align-middle"><span hlmSkeleton class="h-4 w-20"></span></td>
                <td class="p-2 align-middle"><span hlmSkeleton class="h-4 w-24"></span></td>
                <td class="p-2 align-middle"><span hlmSkeleton class="h-4 w-20"></span></td>
                <td class="hidden p-2 align-middle sm:table-cell">
                  <span hlmSkeleton class="h-4 w-12"></span>
                </td>
                <td class="hidden p-2 align-middle md:table-cell">
                  <span hlmSkeleton class="h-4 w-32"></span>
                </td>
                <td class="hidden p-2 align-middle lg:table-cell">
                  <span hlmSkeleton class="h-4 w-24"></span>
                </td>
                <td class="hidden p-2 align-middle xl:table-cell">
                  <span hlmSkeleton class="h-4 w-28"></span>
                </td>
                <td class="p-2 align-middle"><span hlmSkeleton class="h-8 w-8"></span></td>
              </tr>
            }
          </tbody>
        </table>
      } @else {
        <table class="w-full caption-bottom text-sm">
          <thead class="[&>tr]:border-b">
            <tr class="hover:bg-muted/50 border-b transition-colors">
              <th class="text-foreground h-10 px-2 text-left align-middle font-medium">Placa</th>
              <th class="text-foreground h-10 px-2 text-left align-middle font-medium">Marca</th>
              <th class="text-foreground h-10 px-2 text-left align-middle font-medium">Modelo</th>
              <th class="text-foreground hidden h-10 px-2 text-left align-middle font-medium sm:table-cell">
                Ano
              </th>
              <th class="text-foreground hidden h-10 px-2 text-left align-middle font-medium md:table-cell">
                Chassi
              </th>
              <th class="text-foreground hidden h-10 px-2 text-left align-middle font-medium lg:table-cell">
                Renavam
              </th>
              <th class="text-foreground hidden h-10 px-2 text-left align-middle font-medium xl:table-cell">
                Criado em
              </th>
              <th class="h-10 w-[70px] px-2 text-left align-middle font-medium">Ações</th>
            </tr>
          </thead>
          <tbody class="[&>tr:last-child]:border-0">
            @for (vehicle of vehicles(); track vehicle.id) {
              <tr class="hover:bg-muted/50 border-b transition-colors">
                <td class="p-2 align-middle font-medium">{{ vehicle.plate }}</td>
                <td class="p-2 align-middle">{{ vehicle.marca }}</td>
                <td class="p-2 align-middle">{{ vehicle.modelo }}</td>
                <td class="hidden p-2 align-middle sm:table-cell">{{ vehicle.ano }}</td>
                <td class="hidden p-2 align-middle font-mono text-xs md:table-cell">{{ vehicle.chassi }}</td>
                <td class="hidden p-2 align-middle font-mono text-xs lg:table-cell">{{ vehicle.renavam }}</td>
                <td class="hidden p-2 align-middle xl:table-cell">{{ formatDate(vehicle.createdAt) }}</td>
                <td class="p-2 align-middle">
                  <button
                    hlmBtn
                    variant="ghost"
                    size="icon"
                    type="button"
                    [hlmDropdownMenuTrigger]="vehicleMenu"
                    aria-label="Ações"
                  >
                    <lucide-icon name="more-horizontal" class="size-4" />
                  </button>
                  <ng-template #vehicleMenu>
                    <div hlmDropdownMenu class="min-w-40">
                      <a
                        hlmDropdownMenuItem
                        class="flex cursor-pointer items-center gap-2"
                        [routerLink]="['/vehicles', vehicle.id]"
                      >
                        <lucide-icon name="eye" class="size-4" />
                        Ver
                      </a>
                      <button
                        hlmDropdownMenuItem
                        type="button"
                        class="flex w-full cursor-pointer items-center gap-2"
                        (click)="edit.emit(vehicle)"
                      >
                        <lucide-icon name="pencil" class="size-4" />
                        Editar
                      </button>
                      <button
                        hlmDropdownMenuItem
                        variant="destructive"
                        type="button"
                        class="flex w-full cursor-pointer items-center gap-2"
                        (click)="remove.emit(vehicle)"
                      >
                        <lucide-icon name="trash-2" class="size-4" />
                        Excluir
                      </button>
                    </div>
                  </ng-template>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class VehiclesTable {
  readonly vehicles = input<Vehicle[]>([]);
  readonly isLoading = input(false);
  readonly edit = output<Vehicle>();
  readonly remove = output<Vehicle>();

  formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(dateString));
  }
}
