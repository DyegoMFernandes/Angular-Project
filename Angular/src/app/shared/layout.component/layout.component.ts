import { Component, computed, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  private readonly authService = inject(AuthService);

  isAuthenticated = computed(() => this.authService.isAuthenticated());
  userEmail = computed(() => this.authService.getUserEmail());

  logout() {
    this.authService.logout();
  }
}
