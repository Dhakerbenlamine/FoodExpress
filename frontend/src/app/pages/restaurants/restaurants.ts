import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Restaurant } from '../../core/services/restaurant/restaurant';
import { ImageUrlPipe } from '../../core/pipes/image-url-pipe';

@Component({
  selector: 'app-restaurants',
  imports: [FormsModule, RouterLink, NgFor, NgIf, ImageUrlPipe],
  templateUrl: './restaurants.html',
  styleUrl: './restaurants.css',
})
export class Restaurants implements OnInit {
  private readonly service = inject(Restaurant);
  private readonly route = inject(ActivatedRoute);
  private readonly changeDetector = inject(ChangeDetectorRef);
  nom = '';
  typeCuisine = '';
  isOpen = '';
  page = 1;
  totalPages = 1;
  restaurants: any[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.nom = params.get('nom') || '';
      this.typeCuisine = params.get('typeCuisine') || '';
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.error = '';
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
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Impossible de charger les restaurants.';
        this.changeDetector.markForCheck();
      }
    });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.page = page;
    this.load();
  }
}
