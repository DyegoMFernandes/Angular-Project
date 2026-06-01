import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductModel } from './product.model';
import { ProductService } from './product';
import { AuthService } from '../auth/auth.service';

export interface ProductStoreState {
  product: readonly ProductModel[];
  loading: boolean;
  error: HttpErrorResponse | null;
}

const initialState: ProductStoreState = {
  product: [],
  loading: false,
  error: null,
};

@Injectable()
export class ProductStore {
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly state = signal<ProductStoreState>(initialState);

  product = computed(() => this.state().product);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);

  addProduct(product: ProductModel, onSuccess?: (createdProduct: ProductModel) => void) {
    this.setLoading();
    this.productService
      .addProduct(product)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (createdProduct) => {
          this.state.update((state) => ({
            ...state,
            product: [...state.product, createdProduct],
            loading: false,
            error: null,
          }));
          onSuccess?.(createdProduct);
        },
        error: (error: HttpErrorResponse) => {
          this.setError(error);
        },
      });
  }

  updateProduct(product: ProductModel, onSuccess?: () => void) {
    this.setLoading();
    this.productService
      .updateProduct(product)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.state.update((state) => {
            const productIndex = state.product.findIndex(
              (item) => item.productID === product.productID
            );

            if (productIndex === -1) {
              return { ...state, loading: false, error: null };
            }

            const updatedProducts = [...state.product];
            updatedProducts[productIndex] = {
              ...updatedProducts[productIndex],
              ...product,
            };

            return {
              ...state,
              product: updatedProducts,
              loading: false,
              error: null,
            };
          });
          onSuccess?.();
        },
        error: (error: HttpErrorResponse) => {
          this.setError(error);
        },
      });
  }

  deleteProduct(id: number) {
    this.setLoading();
    this.productService
      .deleteProduct(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.state.update((state) => ({
            ...state,
            product: state.product.filter((item) => item.productID !== id),
            loading: false,
            error: null,
          }));
        },
        error: (error: HttpErrorResponse) => {
          this.setError(error);
        },
      });
  }

  loadProducts() {
    this.setLoading();

    if (!this.authService.isAuthenticated()) {
      this.state.set(initialState);
      return;
    }

    this.productService
      .getProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) =>
          this.state.update((state) => ({
            ...state,
            product: products,
            loading: false,
            error: null,
          })),
        error: (error: HttpErrorResponse) => {
          this.setError(error);
        },
      });
  }

  private setLoading() {
    this.state.update((state) => ({
      ...state,
      loading: true,
      error: null,
    }));
  }

  private setError(error: HttpErrorResponse) {
    this.state.update((state) => ({
      ...state,
      loading: false,
      error,
    }));
  }

  constructor() {
    this.loadProducts();
  }
}
