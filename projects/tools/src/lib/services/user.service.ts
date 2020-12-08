import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'projects/tools/src/environments/environment';
import { GlobalService } from './global-service.service';
import { ErrorHandlingService } from 'projects/tools/src/lib/services/error-handling.service';
import { NotificationService } from 'projects/tools/src/lib/services/notification.service';
import { User } from 'projects/tools/src/lib/models/user.model';
import { catchError, delay, map, tap } from 'rxjs/operators';


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
  private readonly currentUser: BehaviorSubject<User> = new BehaviorSubject<User>(null as any);
  /**
   * Expose the observable$ part of the currentUser subject (read only stream)
   */
  readonly currentUser$: Observable<User> = this.currentUser.asObservable();
  /**
   * Users who are members of a given family
   */
  public users: User[] = [
    new User('', '', { name: '', isChild: false }, undefined, ''),
    new User('', '', { name: '', isChild: false }, undefined, ''),
    new User('', '', { name: '', isChild: false }, undefined, '')
  ];
  /**
   * Users as parents + children group
   */
  public familyUsers: User[] = [
    new User('', '', { name: '', isChild: false }, undefined, ''),
    new User('', '', { name: '', isChild: false }, undefined, ''),
    new User('', '', { name: 'Schtroumpfs', isChild: true }, undefined, '')
  ];
  /**
   * Children emails for display convenience
   */
  public childrenEmails: string[] = [];

  /**
   * Variables representing a part of application state, in a Redux inspired way
   */
  private userStore: {
    currentUser: User,
    users: User[],
    familyUsers: User[]
  } = {
    currentUser: null as any,
    users: [],
    familyUsers: []
  };

  constructor(
    private http: HttpClient,
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
  public setCurrentUser(userDecoded: User & { iat: number, exp: number } | null): void {
    let user: User = null as any;

    if (userDecoded) {
      user = new User(
        userDecoded.mobile || '',
        userDecoded.email,
        userDecoded.profile,
        undefined,
        userDecoded._id
      );
    }
    console.log(user);

    this.userStore.currentUser = user as User;
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

  /**
   * Get all users / family members
   */
  public getUsers(): User[] {
    return this.userStore.users;
  }

  /**
   * Get all users / family members from backend
   */
  public getAllUsers(): Observable<User[]> {
    const url = `${this.baseUrlUser}`;
    return this.http.get<User[]>(url)
      .pipe(
        // delay(1000),
        map((users: User[]) => {
          const usersWellFormatted = users.map((user: User) => new User(
            user.mobile || '',
            user.email,
            user.profile,
            undefined,
            user._id
          ));

          this.familyUsers = [];
          const childs: User[] = [];
          usersWellFormatted.forEach((user: User) => {
            if (!user.profile.isChild) {
              this.familyUsers.push(user);
            } else {
              childs.push(user);
              this.childrenEmails.push(user.email);
            }
          });
          // on pousse les schtroumpfs dans le dernier user
          this.familyUsers.push(new User('0000', 'child@child.child', { name: 'Schtroumpfs', isChild: true }, childs, ''));

          this.users = usersWellFormatted;
          this.userStore.users = usersWellFormatted;
          this.userStore.familyUsers = this.familyUsers;
          console.log(this.familyUsers);

          return usersWellFormatted;
        }),
        catchError(error => this.handleError(error))
      );
  }
}
