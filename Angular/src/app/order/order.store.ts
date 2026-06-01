import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrderModel } from './order.model';
import { OrderService } from './order';
import { AuthService } from '../auth/auth.service';

interface OrderStoreState {
  orders: readonly OrderModel[];
  loading: boolean;
  error: HttpErrorResponse | null;
}

const initialState: OrderStoreState = {
  orders: [],
  loading: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class OrderStore {
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly state = signal<OrderStoreState>(initialState);

  orders = computed(() => this.state().orders);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);

  loadOrders() {
    if (!this.authService.isAuthenticated()) {
      this.state.set(initialState);
      return;
    }

    this.setLoading();
    this.orderService
      .getOrders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (orders) => {
          this.state.update((state) => ({
            ...state,
            orders,
            loading: false,
            error: null,
          }));
        },
        error: (error: HttpErrorResponse) => this.setError(error),
      });
  }

  createOrder(totalAmount: number, onSuccess?: () => void) {
    this.setLoading();
    this.orderService
      .createOrder(totalAmount)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (order) => {
          this.state.update((state) => ({
            ...state,
            orders: [order, ...state.orders],
            loading: false,
            error: null,
          }));
          onSuccess?.();
        },
        error: (error: HttpErrorResponse) => this.setError(error),
      });
  }

  deleteOrder(id: number) {
    this.setLoading();
    this.orderService
      .deleteOrder(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.state.update((state) => ({
            ...state,
            orders: state.orders.filter((order) => order.orderId !== id),
            loading: false,
            error: null,
          }));
        },
        error: (error: HttpErrorResponse) => this.setError(error),
      });
  }

  private setLoading() {
    this.state.update((state) => ({ ...state, loading: true, error: null }));
  }

  private setError(error: HttpErrorResponse) {
    this.state.update((state) => ({ ...state, loading: false, error }));
  }
}
