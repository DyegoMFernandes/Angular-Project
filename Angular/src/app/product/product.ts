import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ProductModel } from './product.model';

@Injectable({
  providedIn: 'root',
})

export class ProductService {
  private readonly http = inject(HttpClient);
  private url = `${environment.apiUrl}/Products`;

  getProducts() {
    return this.http.get<ProductModel[]>(this.url);
  }

  getProductById(id: number) {
    return this.http.get<ProductModel>(`${this.url}/${id}`);
  }

  addProduct(product: ProductModel) {
    return this.http.post<ProductModel>(this.url, product);
  }
  
  updateProduct(product: ProductModel) {
    return this.http.put<void>(`${this.url}/${product.productID}`, product);
  }

  deleteProduct(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
 
}
