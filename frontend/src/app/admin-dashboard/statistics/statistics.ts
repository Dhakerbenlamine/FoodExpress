import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { Admin } from '../../core/services/admin/admin';
import { AdminNav } from '../../shared/admin-nav/admin-nav';

@Component({
  selector: 'app-statistics',
  imports: [NgIf, AdminNav],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css',
})
export class Statistics {
  private readonly admin = inject(Admin);
  private readonly changeDetector = inject(ChangeDetectorRef);
  stats: any = null;
  constructor() {
    this.admin.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.changeDetector.markForCheck();
      }
    });
  }
}
