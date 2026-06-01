import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ShoppingCartStore } from '../../shoppingcart/shoppingcart.store';
import { OrderStore } from '../../order/order.store';

@Component({
  selector: 'app-shoppingcart.component',
  imports: [CurrencyPipe],
  templateUrl: './shoppingcart.component.html',
  styleUrl: './shoppingcart.component.css',
})
export class ShoppingcartComponent {
  private readonly shoppingCartStore = inject(ShoppingCartStore);
  private readonly orderStore = inject(OrderStore);

  readonly itemViews = this.shoppingCartStore.itemViews;
  readonly totalAmount = this.shoppingCartStore.totalAmount;
  readonly loading = this.shoppingCartStore.loading;
  readonly error = this.shoppingCartStore.error;
  readonly orderLoading = this.orderStore.loading;

  constructor() {
    this.shoppingCartStore.loadCart();
  }

  removeItem(cartItemID: number) {
    this.shoppingCartStore.removeCartItem(cartItemID);
  }

  updateQuantity(itemCartID: number, value: string) {
    const item = this.itemViews().find((cartItem) => cartItem.cartItemID === itemCartID);
    if (!item) {
      return;
    }

    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || parsedValue < 1) {
      this.shoppingCartStore.updateCartItemQuantity(item, 1);
      return;
    }

    this.shoppingCartStore.updateCartItemQuantity(item, parsedValue);
  }

  checkout() {
    const totalAmount = this.totalAmount();

    if (totalAmount <= 0) {
      return;
    }

    this.orderStore.createOrder(totalAmount, () => {
      this.shoppingCartStore.loadCart();
    });
  }
}
