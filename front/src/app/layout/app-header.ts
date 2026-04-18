import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { ThemeService } from '../core/theme.service';

const API_VERSION = '1.0.0';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    ...HlmButtonImports,
    ...HlmSeparatorImports,
    ...HlmSidebarImports,
  ],
  template: `
    <header class="bg-background flex h-14 items-center gap-4 border-b px-4">
      <button hlmSidebarTrigger type="button"></button>
      <div hlmSeparator orientation="vertical" class="h-6"></div>
      <div class="flex-1"></div>
      <span class="hidden text-sm text-muted-foreground sm:block">API v{{ apiVersion }}</span>
      <button
        hlmBtn
        variant="ghost"
        size="icon"
        type="button"
        class="relative"
        (click)="theme.toggleLightDark()"
        aria-label="Alternar tema"
      >
        <lucide-icon
          name="sun"
          class="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
        />
        <lucide-icon
          name="moon"
          class="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
        />
      </button>
    </header>
  `,
})
export class AppHeader {
  readonly theme = inject(ThemeService);
  readonly apiVersion = API_VERSION;
}
