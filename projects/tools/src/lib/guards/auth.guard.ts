import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CoreConstants } from 'projects/tools/src/lib/core-constants';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { UtilitiesService } from '../services/utilities.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {
  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private utilitiesService: UtilitiesService
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const token = this.authService.getToken();
    if (token) {

      const isAdmin = false;
      // const isAdmin = this.userService.getCurrentUser()?.admin;

      const isAdminApp = () => {
        const hostname = this.utilitiesService.getHostname();
        const port = this.utilitiesService.getPort();
        const adminHostnames = [''];
        return (port && port === '4201') || (adminHostnames.includes(hostname));
      };

      if (isAdminApp() && !isAdmin) {
        console.log('AuthGuard - Admin app + user non admin - Accès non autorisé');
        return false;
      }

      return true;
    }

    console.log('AuthGuard - Accès non autorisé');
    this.router.navigate([CoreConstants.routePath.login], { queryParams: { returnUrl: state.url } });
    return false;
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  }

}
