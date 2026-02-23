import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleViewService } from '../services/role-view.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '../pipes/t.pipe';
import { LanguageService } from '../services/language.service';
import { UserService } from '../services/user.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe
  ],
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  mode: 'login' | 'register' = 'login';
  error = '';
  success = '';
  showLoginPassword = false;
  showRegisterPassword = false;

  constructor(
    private auth: AuthService,
    private users: UserService,
    private roleView: RoleViewService,
    private router: Router,
    private fb: FormBuilder,
    private language: LanguageService,
    private toast: ToastService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s-]{7,20}$/)]]
    });

    this.registerForm.get('username')?.valueChanges.subscribe(() => this.clearUsernameTakenError());
    this.registerForm.get('email')?.valueChanges.subscribe(() => this.clearEmailTakenError());
  }

  login() {
    this.error = '';
    this.success = '';
    if (this.loginForm.invalid) return;
    const username = (this.loginForm.value.username || '').toString().trim().toLowerCase();
    const password = (this.loginForm.value.password || '').toString();
    this.auth.login(username, password).subscribe({
      next: () => this.navigateByRole(),
      error: () => {
        this.error = this.language.t('login.invalidCredentials');
        this.toast.error(this.error);
      }
    });
  }

  guestLogin() {
    this.error = '';
    this.success = '';
    this.auth.guestLogin().subscribe({
      next: () => this.navigateByRole(),
      error: () => {
        this.error = this.language.t('login.guestFailed');
        this.toast.error(this.error);
      }
    });
  }

  register() {
    this.error = '';
    this.success = '';
    if (this.registerForm.invalid) {
      this.error = this.language.t('login.registerValidation');
      this.toast.error(this.error);
      return;
    }

    const payload = {
      ...this.registerForm.value,
      username: (this.registerForm.value.username || '').toString().trim().toLowerCase(),
      email: (this.registerForm.value.email || '').toString().trim().toLowerCase(),
      name: (this.registerForm.value.name || '').toString().trim(),
      phone: (this.registerForm.value.phone || '').toString().trim()
    };

    this.users.register(payload).subscribe({
      next: () => {
        const username = payload.username;
        this.success = this.language.t('login.registerSuccess');
        this.toast.success(this.success);
        this.mode = 'login';
        this.registerForm.reset();
        this.loginForm.patchValue({ username, password: '' });
      },
      error: (err: HttpErrorResponse) => {
        const backendMessage = this.extractBackendMessage(err);
        const usernameConflict = /username/i.test(backendMessage ?? '');
        const emailConflict = err.status === 409 && /email/i.test(backendMessage ?? '');

        if (usernameConflict) {
          this.error = this.language.t('login.usernameTaken');
          this.markUsernameTaken();
          this.toast.error(this.error);
          return;
        }

        if (emailConflict) {
          this.error = this.language.t('login.emailTaken');
          this.markEmailTaken();
          this.toast.error(this.error);
          return;
        }

        if (err.status === 409) {
          this.error = this.language.t('login.registerConflict');
          this.toast.error(this.error);
          return;
        }

        this.error = backendMessage || this.language.t('login.registerFailed');
        this.toast.error(this.error);
      }
    });
  }

  setMode(mode: 'login' | 'register') {
    this.mode = mode;
    this.error = '';
    this.success = '';
    this.showLoginPassword = false;
    this.showRegisterPassword = false;
  }

  private navigateByRole() {
    const view = this.roleView.getRoleView(this.auth.getRole(), this.auth.getUsername());
    this.router.navigate([this.roleView.getRouteForView(view)]);
  }

  toggleLoginPassword(): void {
    this.showLoginPassword = !this.showLoginPassword;
  }

  toggleRegisterPassword(): void {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  private markUsernameTaken() {
    const usernameControl = this.registerForm.get('username');
    if (!usernameControl) return;
    usernameControl.setErrors({ ...(usernameControl.errors ?? {}), taken: true });
    usernameControl.markAsTouched();
  }

  private clearUsernameTakenError() {
    const usernameControl = this.registerForm.get('username');
    if (!usernameControl?.errors?.['taken']) return;
    const errors = { ...usernameControl.errors };
    delete errors['taken'];
    usernameControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
  }

  private markEmailTaken() {
    const emailControl = this.registerForm.get('email');
    if (!emailControl) return;
    emailControl.setErrors({ ...(emailControl.errors ?? {}), taken: true });
    emailControl.markAsTouched();
  }

  private clearEmailTakenError() {
    const emailControl = this.registerForm.get('email');
    if (!emailControl?.errors?.['taken']) return;
    const errors = { ...emailControl.errors };
    delete errors['taken'];
    emailControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
  }

  private extractBackendMessage(err: HttpErrorResponse): string {
    if (typeof err.error === 'string') {
      return err.error;
    }

    const message = err.error?.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    const error = err.error?.error;
    if (typeof error === 'string' && error.trim()) {
      return error;
    }

    return '';
  }
}
