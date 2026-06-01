import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoginModel } from './login.model';
import { AuthResponseModel } from './auth-response.model';
import { RegisterModel } from './register.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private url = `${environment.apiUrl}/Auth`;


  login(data: LoginModel) {
    return this.http.post<AuthResponseModel>(`${this.url}/login`, data);
  }

  register(data: RegisterModel) {
    return this.http.post(`${this.url}/register`, data);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_email');
    localStorage.removeItem('auth_user_id');
  }

  saveSession(response: AuthResponseModel) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('auth_email', response.email);
    localStorage.setItem('auth_user_id', response.userId);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUserEmail() {
    return localStorage.getItem('auth_email');
  }

  getUserId() {
    return localStorage.getItem('auth_user_id');
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}
