import { Injectable, Inject, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CoreConstants } from 'projects/tools/src/lib/core-constants';
import { GlobalService } from './global-service.service';
import { ErrorHandlingService } from 'projects/tools/src/lib/services/error-handling.service';
import { NotificationService } from './notification.service';
export const WINDOW = new InjectionToken<Window>('window');


@Injectable({
  providedIn: 'root'
})
export class UtilitiesService extends GlobalService {
  /**
   * Private boolean that tells us if frontend app is in maitenance mode,
   * as a behavior subject so we can provide a default value
   * Nobody outside the ApplicationReferentielService should have access to this BehaviorSubject
   */
  private readonly isInMaintenance = new BehaviorSubject<boolean>(false);
  /**
   * Expose the observable$ part of the isInMaintenance subject (read only stream)
   */
  readonly isInMaintenance$: Observable<boolean> = this.isInMaintenance.asObservable();
  /**
   * Variables representing a part of application state, in a Redux inspired way
   */
  private utilitiesStore: {
    isInMaintenance: boolean
  } = { isInMaintenance: false };

  constructor(
    private http: HttpClient,
    private router: Router,
    private clipboard: Clipboard,
    private notificationService: NotificationService,
    protected errorHandlingService: ErrorHandlingService,
    @Inject(WINDOW) private window: Window
  ) {
    super(errorHandlingService);
  }

  /**
   * Detects if device is on iOS
   */
  isIos(): boolean {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test( userAgent );
  }

  /**
   * Detects if device is in standalone mode (iOS specific)
   */
  isInStandaloneModeiOS(): boolean {
    return ('standalone' in (window as any).navigator) && ((window as any).navigator.standalone);
  }

  /**
   * Detects if device is in standalone mode (Chrome specific)
   */
  isInStandaloneModeChrome(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches;
  }

  getHostname(): string {
    return this.window.location.hostname;
  }

  getPort(): string {
    return this.window.location.port;
  }

  getProtocol(): string {
    return this.window.location.protocol;
  }

  getOrigin(): string {
    return this.window.location.origin;
  }

  /**
   * Check if frontend is in maintenance mode
   */
  isAppInMaintenanceMode(): Observable<boolean> {
    // const url = `${this.baseUrlReferentielAdmin}/management/is-in-maintenance`;
    // @testing
    // return throwError('aïe aïe aïe...');
    // return of('bobby' as any);
    return of(false);
    // return this.http.get<{inMaintenance: boolean}>(url)
    //   .pipe(
    //     // delay(1000),
    //     map((response: {inMaintenance: boolean}) => {
    //       if (!response || !response.hasOwnProperty('inMaintenance') || typeof(response.inMaintenance) !== 'boolean') {
    //         this.notificationService.sendNotification(
    //           'Désolé, nous n\'avons pas pu récupérer certaines informations, votre site est en maintenance.',
    //           'OK',
    //           { duration: 5000 }
    //         );
    //         return false;
    //       }
    //       this.setMaintenanceMode(response.inMaintenance);
    //       return response.inMaintenance;
    //     }),
    //     catchError((error: any) => {
    //       this.setMaintenanceMode(true);
    //       return catchError((error: any) => this.handleError(error));
    //     })
    //   );
  }

  /**
   * Assign a value to this.isInMaintenance - will push it onto the observable
   * and down to all of its subscribers
   * If app is in maintenance mode, log user out and redirect him to maintenance page
   */
  public setMaintenanceMode(isInMaintenance: boolean): void {
    this.utilitiesStore.isInMaintenance = isInMaintenance;
    this.isInMaintenance.next(Object.assign({}, this.utilitiesStore).isInMaintenance);

    if (isInMaintenance) {
      this.router.navigate([CoreConstants.routePath.maintenance]);
    }
  }

  /**
   * Allows user to copy a value into clipboard
   */
  copyToClipboard(value: string, notificationMessage: string, dateFormat = false): void {
    if (dateFormat) {
      this.clipboard.copy(new Date(Number(value)).toLocaleDateString() + ' ' + new Date(Number(value)).toLocaleTimeString());
    } else {
      this.clipboard.copy(value);
    }
    this.notificationService.sendNotification('Copié !');
  }
}
