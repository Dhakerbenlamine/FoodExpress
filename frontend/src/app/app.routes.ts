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
import { authGuardGuard } from './core/guards/auth-guard-guard';
import { roleGuardGuard } from './core/guards/role-guard-guard';
import { Dashboard } from './restaurant-dashboard/dashboard/dashboard';
import { ManageDishes } from './restaurant-dashboard/manage-dishes/manage-dishes';
import { ManageOrders } from './restaurant-dashboard/manage-orders/manage-orders';
import { Users } from './admin-dashboard/users/users';
import { Restaurants as AdminRestaurants } from './admin-dashboard/restaurants/restaurants';
import { Categories } from './admin-dashboard/categories/categories';
import { Statistics } from './admin-dashboard/statistics/statistics';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'restaurants', component: Restaurants },
  { path: 'restaurants/:id', component: RestaurantDetails },
  { path: 'cart', component: Cart },
  { path: 'checkout', component: Checkout, canActivate: [authGuardGuard] },
  { path: 'my-orders', component: MyOrders, canActivate: [authGuardGuard, roleGuardGuard], data: { roles: ['client'] } },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'profile', component: Profile, canActivate: [authGuardGuard] },
  {
    path: 'restaurant-dashboard',
    canActivate: [authGuardGuard, roleGuardGuard],
    data: { roles: ['restaurateur', 'admin'] },
    children: [
      { path: '', component: Dashboard },
      { path: 'dishes', component: ManageDishes },
      { path: 'orders', component: ManageOrders }
    ]
  },
  {
    path: 'admin-dashboard',
    canActivate: [authGuardGuard, roleGuardGuard],
    data: { roles: ['admin'] },
    children: [
      { path: '', redirectTo: 'statistics', pathMatch: 'full' },
      { path: 'users', component: Users },
      { path: 'restaurants', component: AdminRestaurants },
      { path: 'categories', component: Categories },
      { path: 'statistics', component: Statistics }
    ]
  },
  { path: '**', redirectTo: '' }
];
