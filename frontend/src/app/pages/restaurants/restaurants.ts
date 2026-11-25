import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Restaurant } from '../../core/services/restaurant/restaurant';

@Component({
  selector: 'app-restaurants',
  imports: [FormsModule, RouterLink, NgFor, NgIf],
  templateUrl: './restaurants.html',
  styleUrl: './restaurants.css',
})
export class Restaurants implements OnInit {
  private readonly service = inject(Restaurant);
  private readonly route = inject(ActivatedRoute);
  nom = '';
  typeCuisine = '';
  isOpen = '';
  page = 1;
  totalPages = 1;
  restaurants: any[] = [];
  loading = false;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.nom = params.get('nom') || '';
      this.typeCuisine = params.get('typeCuisine') || '';
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.service.getAll({
      nom: this.nom,
      typeCuisine: this.typeCuisine,
      isOpen: this.isOpen,
      page: this.page,
      limit: 9
    }).subscribe({
      next: (result) => {
        this.restaurants = result.restaurants || [];
        this.totalPages = result.pagination?.pages || 1;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.page = page;
    this.load();
  }
}
