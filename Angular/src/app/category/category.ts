import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CategoryModel } from './category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/Categories`;

  getCategories() {
    return this.http.get<CategoryModel[]>(this.url);
  }

  createCategory(category: Omit<CategoryModel, 'categoryID'>) {
    return this.http.post<CategoryModel>(this.url, category);
  }

  updateCategory(category: CategoryModel) {
    return this.http.put<CategoryModel>(`${this.url}/${category.categoryID}`, category);
  }

  deleteCategory(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
