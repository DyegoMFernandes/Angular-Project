import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { StockModel } from './stock.model';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/Stock`;

  getStocks() {
    return this.http.get<StockModel[]>(this.url);
  }

  createStock(stock: Omit<StockModel, 'stockID'>) {
    return this.http.post<StockModel>(this.url, stock);
  }

  updateStock(stock: StockModel) {
    return this.http.put<StockModel>(`${this.url}/${stock.stockID}`, stock);
  }

  deleteStock(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
