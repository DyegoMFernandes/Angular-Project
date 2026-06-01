import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ShoppingCartModel } from './shoppingcart.model';

@Injectable({
  providedIn: 'root',
})
export class ShoppingCartService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/ShoppingCart`;

  getShoppingCarts() {
    return this.http.get<ShoppingCartModel[]>(this.url);
  }

  createShoppingCart() {
    return this.http.post<ShoppingCartModel>(this.url, {
      cartID: 0,
      userId: '',
    });
  }

  deleteShoppingCart(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
