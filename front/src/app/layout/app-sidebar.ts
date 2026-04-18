import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, ...HlmSidebarImports],
  template: `
    <div hlmSidebarWrapper class="min-h-svh">
      <hlm-sidebar collapsible="icon" variant="sidebar" side="left" class="border-r border-sidebar-border">
        <hlm-sidebar-header class="border-b border-sidebar-border px-4 py-4">
          <a routerLink="/" class="flex items-center gap-2">
            <div
              class="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
            >
              <lucide-icon name="car" class="size-4" />
            </div>
            <span class="text-lg font-semibold">Veículos</span>
          </a>
        </hlm-sidebar-header>
        <hlm-sidebar-content>
          <hlm-sidebar-group>
            <div hlmSidebarGroupLabel>Menu</div>
            <div hlmSidebarGroupContent>
              <ul hlmSidebarMenu>
                <li hlmSidebarMenuItem>
                  <a
                    hlmSidebarMenuButton
                    routerLink="/"
                    routerLinkActive
                    [routerLinkActiveOptions]="{ exact: true }"
                    #homeRla="routerLinkActive"
                    [isActive]="homeRla.isActive"
                  >
                    <lucide-icon name="home" class="size-4" />
                    <span>Início</span>
                  </a>
                </li>
                <li hlmSidebarMenuItem>
                  <a
                    hlmSidebarMenuButton
                    routerLink="/vehicles"
                    routerLinkActive
                    #vehRla="routerLinkActive"
                    [isActive]="vehRla.isActive"
                  >
                    <lucide-icon name="car" class="size-4" />
                    <span>Veículos</span>
                  </a>
                </li>
              </ul>
            </div>
          </hlm-sidebar-group>
        </hlm-sidebar-content>
      </hlm-sidebar>
      <ng-content />
    </div>
  `,
})
export class AppSidebar {}
