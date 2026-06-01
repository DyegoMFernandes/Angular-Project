import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from './auth.service';
import { AuthResponseModel } from './auth-response.model';
import { LoginModel } from './login.model';
import { RegisterModel } from './register.model';

export interface AuthStoreState {
  user: AuthResponseModel | null;
  loading: boolean;
  error: HttpErrorResponse | null;
}

const initialState: AuthStoreState = {
  user: null,
  loading: false,
  error: null,
};

@Injectable()
export class AuthStore {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly state = signal<AuthStoreState>(initialState);

  user = computed(() => this.state().user);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);
  isAuthenticated = computed(() => !!this.state().user || this.authService.isAuthenticated());

  login(data: LoginModel) {
    this.setLoading();

    this.authService
      .login(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.authService.saveSession(response);
          this.state.update((state) => ({
            ...state,
            user: response,
            loading: false,
            error: null,
          }));
        },
        error: (error: HttpErrorResponse) => {
          this.setError(error);
        },
      });
  }

  register(data: RegisterModel) {
    this.setLoading();

    this.authService
      .register(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.state.update((state) => ({
            ...state,
            loading: false,
            error: null,
          }));
        },
        error: (error: HttpErrorResponse) => {
          this.setError(error);
        },
      });
  }

  logout() {
    this.authService.logout();
    this.state.set(initialState);
  }

  private setLoading() {
    this.state.update((state) => ({
      ...state,
      loading: true,
      error: null,
    }));
  }

  private setError(error: HttpErrorResponse) {
    this.state.update((state) => ({
      ...state,
      loading: false,
      error,
    }));
  }
}
