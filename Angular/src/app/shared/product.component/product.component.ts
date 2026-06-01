import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { CategoryStore } from '../../category/category.store';
import { CategoryModel } from '../../category/category.model';
import { ProductCategoryService } from '../../product-category/product-category';
import { ProductCategoryModel } from '../../product-category/product-category.model';
import { ProductModel } from '../../product/product.model';
import { ProductStore } from '../../product/product.store';
import { ShoppingCartStore } from '../../shoppingcart/shoppingcart.store';

@Component({
  selector: 'app-product',
  imports: [CommonModule, ReactiveFormsModule],
  providers: [ProductStore, CategoryStore],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent {
  private readonly productStore = inject(ProductStore);
  private readonly categoryStore = inject(CategoryStore);
  private readonly shoppingCartStore = inject(ShoppingCartStore);
  private readonly productCategoryService = inject(ProductCategoryService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly editingProductId = signal<number | null>(null);
  private readonly selectedCategoryId = signal<number | null>(null);
  private readonly productCategories = signal<ProductCategoryModel[]>([]);

  product = this.productStore.product;
  categories = this.categoryStore.categories;
  loading = this.productStore.loading;
  error = this.productStore.error;
  cartLoading = this.shoppingCartStore.loading;
  cartError = this.shoppingCartStore.error;
  isEditing = computed(() => this.editingProductId() !== null);
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  filteredProducts = computed(() => {
    const selectedCategoryId = this.selectedCategoryId();
    if (selectedCategoryId === null) {
      return this.product();
    }

    const relatedProductIds = new Set(
      this.productCategories()
        .filter((relation) => relation.categoryID === selectedCategoryId)
        .map((relation) => relation.productID)
    );

    return this.product().filter((item) => relatedProductIds.has(item.productID));
  });

  productForm = this.fb.group({
    productName: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    categoryID: [null as number | null, Validators.required],
  });

  constructor() {
    this.categoryStore.loadCategories();
    this.loadProductCategories();
  }

  resetForm() {
    this.productForm.reset({
      productName: '',
      description: '',
      price: 0,
      categoryID: null,
    });
    this.editingProductId.set(null);
    this.productForm.markAsPristine();
    this.productForm.markAsUntouched();
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.getRawValue();
    const productData = {
      productID: 0,
      productName: formValue.productName ?? '',
      description: formValue.description ?? '',
      price: formValue.price ?? 0,
    } as ProductModel;
    const selectedCategoryId = formValue.categoryID;
    const editingId = this.editingProductId();

    if (editingId === null) {
      this.productStore.addProduct(productData, (createdProduct) => {
        if (selectedCategoryId !== null) {
          this.productCategoryService.createProductCategory(createdProduct.productID, selectedCategoryId).subscribe({
            next: (relation) => {
              this.productCategories.update((relations) => [...relations, relation]);
            },
          });
        }
      });
    } else {
      const currentCategoryId =
        this.productCategories().find((relation) => relation.productID === editingId)?.categoryID ?? null;

      this.productStore.updateProduct({
        ...productData,
        productID: editingId,
      }, () => {
        this.syncProductCategory(editingId, currentCategoryId, selectedCategoryId);
      });
    }

    this.resetForm();
  }

  onEdit(product: ProductModel) {
    this.editingProductId.set(product.productID);
    this.productForm.patchValue({
      productName: product.productName,
      description: product.description,
      price: product.price,
      categoryID:
        this.productCategories().find((relation) => relation.productID === product.productID)?.categoryID ?? null,
    });
    this.productForm.markAsPristine();
    this.productForm.markAsUntouched();
  }

  onDelete(productID: number) {
    if(confirm('Are you sure you want to delete this product?')) {
      this.productStore.deleteProduct(productID);
    }
  }

  onAddToCart(product: ProductModel) {
    this.shoppingCartStore.addProductToCart(product);
  }

  selectCategory(category: CategoryModel | null) {
    this.selectedCategoryId.set(category?.categoryID ?? null);
  }

  isSelectedCategory(categoryId: number | null) {
    return this.selectedCategoryId() === categoryId;
  }

  get f() {
    return this.productForm.controls;
  }

  private loadProductCategories() {
    this.productCategoryService.getProductCategories().subscribe({
      next: (relations) => this.productCategories.set(relations),
    });
  }

  private syncProductCategory(productID: number, currentCategoryId: number | null, nextCategoryId: number | null) {
    if (currentCategoryId === nextCategoryId) {
      return;
    }

    if (currentCategoryId !== null) {
      this.productCategoryService.deleteProductCategory(productID, currentCategoryId).subscribe({
        next: () => {
          this.finishCategorySync(productID, nextCategoryId);
        },
      });

      return;
    }

    this.finishCategorySync(productID, nextCategoryId);
  }

  private finishCategorySync(productID: number, nextCategoryId: number | null) {
    if (nextCategoryId === null) {
      this.productCategories.update((relations) =>
        relations.filter((relation) => relation.productID !== productID)
      );
      return;
    }

    this.productCategoryService.createProductCategory(productID, nextCategoryId).subscribe({
      next: (relation) => {
        this.productCategories.update((relations) => {
          const remainingRelations = relations.filter((item) => item.productID !== productID);
          return [...remainingRelations, relation];
        });
      },
    });
  }
}
