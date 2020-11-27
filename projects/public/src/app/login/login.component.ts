import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { CoreConstants } from 'projects/tools/src/lib/core-constants';
import { AuthService } from 'projects/tools/src/lib/services/auth.service';
import { NotificationService } from 'projects/tools/src/lib/services/notification.service';
import { LoginResponse } from 'projects/tools/src/lib/models/login-response.model';


/**
 * Component that displays login form
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({});
  loginLoadingSpinner = false;
  loginError = false;
  hide = true;
  get usernameInput(): AbstractControl | null { return this.loginForm.get('username'); }
  get passwordInput(): AbstractControl | null { return this.loginForm.get('password'); }

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // redirect user to calendar page if already logged
    if (this.authService.getToken()) {
      this.router.navigate([CoreConstants.routePath.root]);
    }
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  public login(): void {
    this.disableLoginForm();
    this.loginLoadingSpinner = true;
    this.loginError = false;

    const email    = (this.loginForm.get('username') as any).value;
    const password = (this.loginForm.get('password') as any).value;

    if (email && password) {
      this.authService.login(email, password).subscribe((loginResponse: LoginResponse) => {
        console.log(loginResponse);
        this.router.navigate([CoreConstants.routePath.root]);
      }, error => {
        // @TODO : gestion fine des erreurs avec le backend + handleError()
        console.error(error);
        this.loginLoadingSpinner = false;
        this.loginError = true;
        this.enableLoginForm();
        const userErrorMsg = error.message ? error.message : 'Erreur inconnue (connexion impossible)';
        this.notificationService.sendNotification(userErrorMsg, '', { panelClass: 'notification-login-by-username-error' });
      });
    }
  }

  disableLoginForm(): void {
    this.loginForm.controls.username.disable();
    this.loginForm.controls.password.disable();
  }

  enableLoginForm(): void {
    this.loginForm.controls.username.enable();
    this.loginForm.controls.password.enable();
  }

  /*
   * Handle form errors
   */
  public errorHandling = (control: string, error: string) => {
    return this.loginForm.controls[control].hasError(error);
  }
}
