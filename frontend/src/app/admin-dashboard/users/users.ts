import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { Admin } from '../../core/services/admin/admin';

@Component({
  selector: 'app-users',
  imports: [FormsModule, NgFor],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  private readonly admin = inject(Admin);
  users: any[] = [];
  search = '';
  constructor() { this.load(); }
  load(): void {
    this.admin.getUsers(this.search).subscribe({
      next: (result) => { this.users = result.users || []; }
    });
  }
  toggle(user: any): void {
    this.admin.toggleUser(user._id).subscribe({ next: () => this.load() });
  }
}
