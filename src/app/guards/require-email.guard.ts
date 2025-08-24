import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthDataService } from '../services/auth-data.service';

@Injectable({ providedIn: 'root' })
export class RequireEmailGuard implements CanActivate {
  constructor(private authData: AuthDataService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const email = this.authData.getEmail();
    if (email) {
      return true;
    }
    const redirectTo: string = route.data && route.data['requiresEmailRedirectTo']
      ? route.data['requiresEmailRedirectTo']
      : '/';
    return this.router.parseUrl(redirectTo);
  }
}


