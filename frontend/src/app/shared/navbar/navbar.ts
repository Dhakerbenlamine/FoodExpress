import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { Auth } from '../../core/services/auth/auth';
import { CartService } from '../../core/services/cart/cart';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  constructor(public auth: Auth, public cart: CartService) {}

  get user() {
    return this.auth.getUser();
  }

  get cartCount(): number {
    return this.cart.getCount();
  }
}
