import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';


/**
 * Error Handling Service
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) { }

  /**
   * Gestion centralisée des erreurs - Affichage des notifications utilisateur
   */
  handleError(error: any): void {
    let userErrorMsg: string;
    let errorStatus: number;
    let errorUrl: string;

    userErrorMsg = error.message ? error.message : 'Erreur inconnue';
    errorStatus = error.status ? error.status : 0;
    errorUrl = error.path ? error.path : '';

    switch (errorStatus) {
      case 500:
        // this.translateService.get('error.500').subscribe((res: {title, body}) => {
        //   this.notificationService.sendNotification(res.title + ' - ' + res.body, '');
        // });
        this.notificationService.sendNotification(userErrorMsg);
        break;

      // App maintenance mode (error.message = 'service.is.under.maintenance') is managed in
      // projects/lib-mycloud/src/lib/core/auth/http.interceptor.ts
      // case 503:
      //   break;

      case 401:
        // don't display 401 error if user is not logged and has just arrived on root page or other authorized public pages
        const publicUrls = ['/', '/documentation/general', '/documentation/authorizations'];
        if (publicUrls.includes(this.router.url) && errorUrl.indexOf('auth/token') !== -1) {
          // do nothing
        } else {
          // this.translateService.get('error.401').subscribe((res: {title, body}) => {
          //   this.notificationService.sendNotification(res.title + ' - ' + res.body, '');
          // });
          this.notificationService.sendNotification(userErrorMsg);
        }
        break;

      default:
        // this.translateService.get('error.defaultError').subscribe((defaultErrorRes: {title, body}) => {
        //   this.notificationService.sendNotification(defaultErrorRes + ' - ' + userErrorMsg, '');
        // });
        this.notificationService.sendNotification(userErrorMsg);
        break;
    }
  }
}
