import { Component, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderStore } from '../../order/order.store';

@Component({
  selector: 'app-order.component',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent {
  private readonly orderStore = inject(OrderStore);

  readonly orders = this.orderStore.orders;
  readonly loading = this.orderStore.loading;
  readonly error = this.orderStore.error;

  constructor() {
    this.orderStore.loadOrders();
  }

  removeOrder(orderId: number) {
    this.orderStore.deleteOrder(orderId);
  }
}
