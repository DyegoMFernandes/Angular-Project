import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoryModel } from './category.model';
import { CategoryService } from './category';

interface CategoryStoreState {
  categories: readonly CategoryModel[];
  loading: boolean;
  error: HttpErrorResponse | null;
}

const initialState: CategoryStoreState = {
  categories: [],
  loading: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class CategoryStore {
  private readonly categoryService = inject(CategoryService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly state = signal<CategoryStoreState>(initialState);

  categories = computed(() => this.state().categories);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);

  loadCategories() {
    this.setLoading();
    this.categoryService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.state.update((state) => ({
            ...state,
            categories,
            loading: false,
            error: null,
          }));
        },
        error: (error: HttpErrorResponse) => this.setError(error),
      });
  }

  createCategory(category: Omit<CategoryModel, 'categoryID'>) {
    this.setLoading();
    this.categoryService
      .createCategory(category)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (createdCategory) => {
          this.state.update((state) => ({
            ...state,
            categories: [...state.categories, createdCategory],
            loading: false,
            error: null,
          }));
        },
        error: (error: HttpErrorResponse) => this.setError(error),
      });
  }

  updateCategory(category: CategoryModel) {
    this.setLoading();
    this.categoryService
      .updateCategory(category)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedCategory) => {
          this.state.update((state) => ({
            ...state,
            categories: state.categories.map((item) =>
              item.categoryID === updatedCategory.categoryID ? updatedCategory : item
            ),
            loading: false,
            error: null,
          }));
        },
        error: (error: HttpErrorResponse) => this.setError(error),
      });
  }

  deleteCategory(id: number) {
    this.setLoading();
    this.categoryService
      .deleteCategory(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.state.update((state) => ({
            ...state,
            categories: state.categories.filter((item) => item.categoryID !== id),
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
