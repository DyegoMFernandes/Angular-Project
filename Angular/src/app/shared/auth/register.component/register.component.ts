import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../auth/auth.store';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  providers: [AuthStore],
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly authStore = inject(AuthStore);
  private readonly submitted = signal(false);

  readonly registerForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly email = this.registerForm.controls.email;
  readonly password = this.registerForm.controls.password;
  readonly confirmPassword = this.registerForm.controls.confirmPassword;
  readonly requestExample = '{ "email": "novo@site.com", "password": "Senha@123" }';
  readonly nextStepExample = 'POST /api/Auth/login para receber token e userId';

  constructor() {
    effect(() => {
      if (this.submitted() && !this.authStore.loading() && !this.authStore.error()) {
        this.submitted.set(false);
        void this.router.navigate(['/login']);
      }
    });
  }

  submit() {
    if (this.registerForm.invalid || this.password.value !== this.confirmPassword.value) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.submitted.set(true);
    this.authStore.register({
      email: this.email.value,
      password: this.password.value,
    });
  }
}
