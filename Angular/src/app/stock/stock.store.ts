import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductModel } from '../product/product.model';
import { ProductService } from '../product/product';
import { StockModel } from './stock.model';
import { StockService } from './stock';

interface StockStoreState {
  stocks: readonly StockModel[];
  products: readonly ProductModel[];
  loading: boolean;
  error: HttpErrorResponse | null;
}

const initialState: StockStoreState = {
  stocks: [],
  products: [],
  loading: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class StockStore {
  private readonly stockService = inject(StockService);
  private readonly productService = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly state = signal<StockStoreState>(initialState);

  stocks = computed(() => this.state().stocks);
  products = computed(() => this.state().products);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);

  loadData() {
    this.setLoading();

    this.productService
      .getProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) => {
          this.state.update((state) => ({ ...state, products }));
          this.loadStocks();
        },
        error: (error: HttpErrorResponse) => this.setError(error),
      });
  }

  private loadStocks() {
    this.stockService
      .getStocks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stocks) => {
          this.state.update((state) => ({
            ...state,
            stocks,
            loading: false,
            error: null,
          }));
        },
        error: (error: HttpErrorResponse) => this.setError(error),
      });
  }

  createStock(stock: Omit<StockModel, 'stockID'>) {
    this.setLoading();
    this.stockService
      .createStock(stock)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (createdStock) => {
          this.state.update((state) => ({
            ...state,
            stocks: [...state.stocks, createdStock],
            loading: false,
            error: null,
          }));
        },
        error: (error: HttpErrorResponse) => this.setError(error),
      });
  }

  updateStock(stock: StockModel) {
    this.setLoading();
    this.stockService
      .updateStock(stock)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedStock) => {
          this.state.update((state) => ({
            ...state,
            stocks: state.stocks.map((item) =>
              item.stockID === updatedStock.stockID ? updatedStock : item
            ),
            loading: false,
            error: null,
          }));
        },
        error: (error: HttpErrorResponse) => this.setError(error),
      });
  }

  deleteStock(id: number) {
    this.setLoading();
    this.stockService
      .deleteStock(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.state.update((state) => ({
            ...state,
            stocks: state.stocks.filter((item) => item.stockID !== id),
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
