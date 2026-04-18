import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';

@Component({
  selector: 'app-pagination-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...HlmPaginationImports],
  template: `
    @if (totalPages() > 1) {
      <nav hlmPagination>
        <ul hlmPaginationContent>
          <li hlmPaginationItem>
            <hlm-pagination-previous
              text="Previous"
              [attr.aria-disabled]="currentPage() === 1 ? 'true' : null"
              [class]="currentPage() === 1 ? 'pointer-events-none opacity-50' : ''"
              (click)="goToPage(currentPage() - 1)"
            />
          </li>

          @for (pageNum of pageNumbers(); track $index) {
            <li hlmPaginationItem>
              @if (pageNum === 'ellipsis') {
                <hlm-pagination-ellipsis />
              } @else {
                <a
                  hlmPaginationLink
                  [isActive]="currentPage() === pageNum"
                  (click)="goToPage(pageNum)"
                  >{{ pageNum }}</a
                >
              }
            </li>
          }

          <li hlmPaginationItem>
            <hlm-pagination-next
              text="Next"
              [attr.aria-disabled]="currentPage() === totalPages() ? 'true' : null"
              [class]="currentPage() === totalPages() ? 'pointer-events-none opacity-50' : ''"
              (click)="goToPage(currentPage() + 1)"
            />
          </li>
        </ul>
      </nav>
    }
  `,
})
export class PaginationBar {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();

  protected pageNumbers(): (number | 'ellipsis')[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | 'ellipsis')[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (current > 3) pages.push('ellipsis');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('ellipsis');
    pages.push(total);
    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
  }
}
