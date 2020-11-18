import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'projects/tools/src/environments/environment';
import { GlobalService } from './global-service.service';
import { ErrorHandlingService } from 'projects/tools/src/lib/services/error-handling.service';
import { NotificationService } from 'projects/tools/src/lib/services/notification.service';
import { User } from 'projects/tools/src/lib/models/user.model';


/**
 * User Service
 * Providing user information and login status utilities
 */
@Injectable({
  providedIn: 'root'
})
export class UserService extends GlobalService {
  protected baseUrlUser = environment.backendApi.baseUrlUser;

  /**
   * Private current logged user, as a behavior subject so we can provide a default value
   * Nobody outside the UserService should have access to this BehaviorSubject
   */
  private readonly currentUser = new BehaviorSubject<User>(new User(''));
  /**
   * Expose the observable$ part of the currentUser subject (read only stream)
   */
  readonly currentUser$: Observable<User> = this.currentUser.asObservable();

  /**
   * Variables representing a part of application state, in a Redux inspired way
   */
  private userStore: {
    currentUser: User
  } = { currentUser: new User('') };

  constructor(
    protected notificationService: NotificationService,
    protected errorHandlingService: ErrorHandlingService
  ) {
    super(errorHandlingService);
  }

  /**
   * Get current user
   */
  public getCurrentUser(): User {
    return this.currentUser.getValue();
  }

  /**
   * Set current user
   */
  public setCurrentUser(userDecoded: { email: string, iat: number, exp: number } | null): void {
    let user: User = new User('');

    if (userDecoded) {
      user = new User(
        userDecoded.email
      );
    }

    this.userStore.currentUser = user;
    this.currentUser.next(Object.assign({}, this.userStore).currentUser);
  }

  // public getCurrentUsername(): string {
  //   return this.userStore.currentUser ? this.userStore.currentUser.username : null; // ex. : Nicolas.MURA.prestataire@bpce-it.fr
  // }

  public getUserFirstNameFromEmail(email: string): string {
    const username = email.substr(0, email.indexOf('@'));
    return username.split('.')[0];
  }

  public getUserLastNameFromEmail(email: string): string {
    const username = email.substr(0, email.indexOf('@'));
    return username.split('.')[1];
  }
}
