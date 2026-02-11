import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleViewService } from '../services/role-view.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  error = '';

  constructor(
    private auth: AuthService,
    private roleView: RoleViewService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.loginForm.invalid) return;
    const { username, password } = this.loginForm.value;
    this.auth.login(username, password).subscribe({
      next: () => this.navigateByRole(),
      error: () => this.error = 'Invalid credentials'
    });
  }

  guestLogin() {
    this.auth.guestLogin().subscribe({
      next: () => this.navigateByRole(),
      error: () => this.error = 'Guest login failed'
    });
  }

  private navigateByRole() {
    const view = this.roleView.getRoleView(this.auth.getRole(), this.auth.getUsername());
    this.router.navigate([this.roleView.getRouteForView(view)]);
  }
}
