import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { Admin } from '../../core/services/admin/admin';

@Component({
  selector: 'app-statistics',
  imports: [NgIf],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css',
})
export class Statistics {
  private readonly admin = inject(Admin);
  stats: any = null;
  constructor() {
    this.admin.getStats().subscribe({ next: (stats) => { this.stats = stats; } });
  }
}
