import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { StockStore } from '../../stock/stock.store';
import { StockModel } from '../../stock/stock.model';

@Component({
  selector: 'app-stock.component',
  imports: [ReactiveFormsModule],
  providers: [StockStore],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.css',
})
export class StockComponent {
  private readonly stockStore = inject(StockStore);
  private readonly fb = inject(FormBuilder);
  private readonly editingStockId = signal<number | null>(null);

  readonly stocks = this.stockStore.stocks;
  readonly products = this.stockStore.products;
  readonly loading = this.stockStore.loading;
  readonly error = this.stockStore.error;
  readonly isEditing = computed(() => this.editingStockId() !== null);

  readonly stockForm = this.fb.group({
    productID: [null as number | null, Validators.required],
    quantity: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    this.stockStore.loadData();
  }

  submit() {
    if (this.stockForm.invalid) {
      this.stockForm.markAllAsTouched();
      return;
    }

    const formValue = this.stockForm.getRawValue();
    const payload = {
      productID: formValue.productID!,
      quantity: formValue.quantity ?? 0,
    };

    const editingId = this.editingStockId();

    if (editingId === null) {
      this.stockStore.createStock(payload);
    } else {
      this.stockStore.updateStock({
        stockID: editingId,
        ...payload,
      });
    }

    this.resetForm();
  }

  editStock(stock: StockModel) {
    this.editingStockId.set(stock.stockID);
    this.stockForm.patchValue({
      productID: stock.productID,
      quantity: stock.quantity,
    });
  }

  deleteStock(id: number) {
    if (confirm('Excluir este registro de estoque?')) {
      this.stockStore.deleteStock(id);
    }
  }

  resetForm() {
    this.editingStockId.set(null);
    this.stockForm.reset({
      productID: null,
      quantity: 0,
    });
  }

  productName(productId: number) {
    return this.products().find((product) => product.productID === productId)?.productName ?? `Produto #${productId}`;
  }

  get f() {
    return this.stockForm.controls;
  }
}
