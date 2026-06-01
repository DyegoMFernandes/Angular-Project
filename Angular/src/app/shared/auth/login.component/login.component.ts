import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../auth/auth.store';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [AuthStore],
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly authStore = inject(AuthStore);
  private readonly submitted = signal(false);

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly email = this.loginForm.controls.email;
  readonly password = this.loginForm.controls.password;
  readonly requestExample = '{ "email": "voce@site.com", "password": "Senha@123" }';
  readonly responseExample = '{ "token": "...", "email": "voce@site.com", "userId": "abc123" }';

  constructor() {
    effect(() => {
      if (this.submitted() && this.authStore.user()) {
        void this.router.navigate(['/home']);
      }
    });
  }

  submit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.submitted.set(true);
    this.authStore.login(this.loginForm.getRawValue());
  }
}
