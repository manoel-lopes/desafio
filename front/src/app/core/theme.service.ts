import {
  computed,
  effect,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'vehicles_theme';

export type ThemePreference = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly systemDark = signal(false);

  /** User preference: light | dark | system */
  readonly preference = signal<ThemePreference>('system');

  /** Resolved theme for UI (light or dark) */
  readonly resolved = computed<'light' | 'dark'>(() => {
    const pref = this.preference();
    if (pref === 'light' || pref === 'dark') return pref;
    return this.systemDark() ? 'dark' : 'light';
  });

  /** For ngx-sonner */
  readonly sonnerTheme = computed<'light' | 'dark' | 'system'>(() => this.preference());

  constructor() {
    if (this.isBrowser) {
      const mq = globalThis.matchMedia('(prefers-color-scheme: dark)');
      this.systemDark.set(mq.matches);
      mq.addEventListener('change', (e) => this.systemDark.set(e.matches));

      const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        this.preference.set(stored);
      }
    }

    effect(() => {
      const resolved = this.resolved();
      if (!this.isBrowser) return;
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    });

    effect(() => {
      const pref = this.preference();
      if (!this.isBrowser) return;
      localStorage.setItem(STORAGE_KEY, pref);
    });
  }

  toggleLightDark(): void {
    const next = this.resolved() === 'dark' ? 'light' : 'dark';
    this.preference.set(next);
  }
}
