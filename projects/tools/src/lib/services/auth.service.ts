import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { LocalStorage } from 'ngx-webstorage';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, catchError, map, tap } from 'rxjs/operators';
import jwt_decode from 'jwt-decode';
import { environment } from 'projects/tools/src/environments/environment';
import { CoreConstants } from 'projects/tools/src/lib/core-constants';
import { GlobalService } from './global-service.service';
import { UserService } from './user.service';
import { ErrorHandlingService } from 'projects/tools/src/lib/services/error-handling.service';
import { NotificationService } from 'projects/tools/src/lib/services/notification.service';
import { LoginResponse } from 'projects/tools/src/lib/models/login-response.model';


/**
 * Authentication Service
 * Providing token, login / signup / logout and session utilities
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService extends GlobalService {
  protected baseUrlAuth = environment.backendApi.baseUrlAuth;

  /**
   * Store token in local storage, allowing to retrieve credentials when application starts
   */
  @LocalStorage('tokenLocalStorage') private tokenLocalStorage: string | undefined;

  /**
   * Private user token, as a behavior subject so we can provide a default value
   * Nobody outside the AuthService should have access to this BehaviorSubject
   */
  private readonly token = new BehaviorSubject<string | null>(null);
  /**
   * Expose the observable$ part of the token subject (read only stream)
   */
  readonly token$: Observable<string | null> = this.token.asObservable();

  /**
   * Variables representing a part of application state, in a Redux inspired way
   */
  private authStore: {
    token: string | null
  } = { token: null };

  constructor(
    private http: HttpClient,
    private router: Router,
    private localStorageService: LocalStorageService,
    private userService: UserService,
    protected notificationService: NotificationService,
    protected errorHandlingService: ErrorHandlingService
  ) {
    super(errorHandlingService);
  }

  /**
   * Check if token exists and is valid, start a session if yes, cancel it if no
   */
  public checkForExistingToken(): void {
    const existingToken = this.getToken();
    console.log(existingToken);
    if (existingToken) {
      // if token exists and is valid, start session
      if (!this.isTokenExpired(existingToken)) {
        this.startSession(existingToken);
      } else {
        // if token is expired, we must cancel session + clear local storage to get a chance to start session next time we login
        this.cancelSession();
        const expirationNotif = this.notificationService.sendNotification('@TODO', '', { duration: 0 });
      }
    } else {
      // got no token, do nothing
    }

  }

  /**
   * Log in
   */
  public login(email: string, password: string): Observable<LoginResponse> {
    const url = `${this.baseUrlAuth}/login`;
    const body = {
      email,
      password
    };
    return this.http.post<LoginResponse>(url, body)
      .pipe(
        delay(1000),
        tap((loginResponse: LoginResponse) => this.startSession(loginResponse.token)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Sign up
   */
  public signup(email: string, password: string): Observable<LoginResponse> {
    const url = `${this.baseUrlAuth}/signup`;
    const body = {
      email,
      password
    };
    return this.http.post<LoginResponse>(url, body)
      .pipe(
        delay(1000),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Log out
   */
  public logout(): void {
    this.cancelSession();
  }

  public startSession(token: string): void {
    this.tokenLocalStorage = token;
    this.authStore.token = token;
    this.token.next(Object.assign({}, this.authStore).token);
    this.userService.setCurrentUser(jwt_decode(token));
  }

  public cancelSession(): void {
    this.localStorageService.clear();
    this.authStore.token = null;
    this.token.next(Object.assign({}, this.authStore).token);
    this.userService.setCurrentUser(null);
    this.router.navigate([CoreConstants.routePath.login]);
  }

  public getToken(): string | null {
    if (this.tokenLocalStorage) {
      return this.tokenLocalStorage;
    }
    return this.token.getValue();
  }

  public isTokenExpired(token: string | null): boolean {
    if (!token) { return true; }

    const date = this.getTokenExpirationDate(token);
    if (!date) { return false; }
    // @testing
    // if (!(date.valueOf() > new Date().valueOf())) {
    //   console.log('Token expiré');
    // } else {
    //   console.log('Token OK');
    // }
    return !(date.valueOf() > new Date().valueOf());
  }

  public getTokenExpirationDate(token: string): Date | null {
    const userDecoded: { email: string, iat: number, exp: number } | null = jwt_decode(token);

    if (!userDecoded || userDecoded.exp === undefined) { return null; }

    const date = new Date(0);
    date.setUTCSeconds(userDecoded.exp);
    return date;
  }
}
