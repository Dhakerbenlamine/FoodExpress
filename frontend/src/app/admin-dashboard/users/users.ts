import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Admin } from '../../core/services/admin/admin';
import { AdminNav } from '../../shared/admin-nav/admin-nav';

@Component({
  selector: 'app-users',
  imports: [FormsModule, NgFor, NgIf, AdminNav],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  private readonly admin = inject(Admin);
  private readonly changeDetector = inject(ChangeDetectorRef);
  users: any[] = [];
  search = '';
  message = '';
  error = '';
  pendingUserId = '';
  constructor() { this.load(); }
  load(): void {
    this.admin.getUsers(this.search).subscribe({
      next: (result) => {
        this.users = result.users || [];
        this.changeDetector.markForCheck();
      }
    });
  }
  toggle(user: any): void {
    this.message = '';
    this.error = '';
    this.pendingUserId = user._id;
    this.admin.toggleUser(user._id).subscribe({
      next: (result) => {
        this.message = result.message;
        this.pendingUserId = '';
        this.load();
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.error = error.error?.message || 'Impossible de modifier ce compte.';
        this.pendingUserId = '';
        this.changeDetector.markForCheck();
      }
    });
  }
}
