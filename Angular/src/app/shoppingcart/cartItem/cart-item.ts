import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CartItemModel } from './cart-item.model';

@Injectable({
  providedIn: 'root',
})
export class CartItemService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/CartItems`;

  getCartItems() {
    return this.http.get<CartItemModel[]>(this.url);
  }

  createCartItem(cartID: number, productID: number, quantity: number) {
    return this.http.post<CartItemModel>(this.url, {
      cartID,
      productID,
      quantity,
    });
  }

  updateCartItem(cartItemID: number, cartID: number, productID: number, quantity: number) {
    return this.http.put<CartItemModel>(`${this.url}/${cartItemID}`, {
      cartItemID,
      cartID,
      productID,
      quantity,
    });
  }

  deleteCartItem(cartItemID: number) {
    return this.http.delete<void>(`${this.url}/${cartItemID}`);
  }
}
