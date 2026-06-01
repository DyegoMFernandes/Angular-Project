import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { OrderModel } from './order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/Orders`;

  getOrders() {
    return this.http.get<OrderModel[]>(this.url);
  }

  createOrder(totalAmount: number) {
    return this.http.post<OrderModel>(this.url, {
      totalAmount,
      orderDate: new Date().toISOString(),
      userId: '',
    });
  }

  deleteOrder(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
