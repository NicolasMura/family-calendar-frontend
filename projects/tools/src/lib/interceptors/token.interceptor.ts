import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationService } from 'projects/tools/src/lib/services/notification.service';
import { AuthService } from 'projects/tools/src/lib/services/auth.service';
import { ErrorHandlingService } from 'projects/tools/src/lib/services/error-handling.service';


/** Inject API Token into the request (if possible and/or permitted) */
@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(
    protected notificationService: NotificationService,
    private authService: AuthService,
    protected errorHandlingService: ErrorHandlingService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      if (request.url.indexOf('auth/login') > 0 ||
        request.url.indexOf('auth/signup') > 0 ||
        request.url.indexOf('management/is-in-maintenance') > 0 || !this.authService.getToken()) {
        return next.handle(request); // do nothing
      }

      const jwtToken = this.authService.getToken();

      if (this.authService.getToken()) {
        if (this.authService.isTokenExpired(jwtToken)) {
          console.log('TokenInterceptor - got token, but expired');
          // @TODO : refresh token (front + back)
          this.authService.logout();
          // if (!this.authService.timeoutDialogRef) {
          //   this.authService.openTimeoutDialog();
          // }
        }
      } else {
        console.log('TokenInterceptor - got no token');
        // @TODO : action ?
        this.notificationService.sendNotification('Pas de token', 'OK', { duration: 0 });
        this.authService.logout();
      }

      request = request.clone({
        setHeaders: {
          'x-access-token': `${jwtToken}`
        }
      });

      return next.handle(request);
  }

}
