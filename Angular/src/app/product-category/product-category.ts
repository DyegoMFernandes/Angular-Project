import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ProductCategoryModel } from './product-category.model';

@Injectable({
  providedIn: 'root',
})
export class ProductCategoryService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/ProductCategory`;

  getProductCategories() {
    return this.http.get<ProductCategoryModel[]>(this.url);
  }

  createProductCategory(productID: number, categoryID: number) {
    return this.http.post<ProductCategoryModel>(this.url, {
      productID,
      categoryID,
    });
  }

  deleteProductCategory(productID: number, categoryID: number) {
    return this.http.delete(`${this.url}/${productID}/${categoryID}`);
  }
}
