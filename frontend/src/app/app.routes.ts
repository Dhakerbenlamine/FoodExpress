import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Restaurants } from './pages/restaurants/restaurants';
import { RestaurantDetails } from './pages/restaurant-details/restaurant-details';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';
import { MyOrders } from './pages/my-orders/my-orders';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'restaurants', component: Restaurants },
  { path: 'restaurants/:id', component: RestaurantDetails },
  { path: 'cart', component: Cart },
  { path: 'checkout', component: Checkout },
  { path: 'my-orders', component: MyOrders },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'profile', component: Profile },
  { path: '**', redirectTo: '' }
];
