import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Restaurant } from '../../core/services/restaurant/restaurant';

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule, NgFor, NgIf],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly restaurantService = inject(Restaurant);
  private readonly router = inject(Router);
  restaurants: any[] = [];
  searchText = '';
  loading = true;
  cuisines = ['Pizza', 'Fast-food', 'Tunisien', 'Italien'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.restaurantService.getAll({ limit: 6 }).subscribe({
      next: (result) => {
        this.restaurants = result.restaurants || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  search(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/restaurants'], { queryParams: { nom: this.searchText } });
  }

  filterCuisine(cuisine: string): void {
    this.router.navigate(['/restaurants'], { queryParams: { typeCuisine: cuisine } });
  }
}
