import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoryStore } from '../../category/category.store';
import { CategoryModel } from '../../category/category.model';

@Component({
  selector: 'app-category.component',
  imports: [ReactiveFormsModule],
  providers: [CategoryStore],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent {
  private readonly categoryStore = inject(CategoryStore);
  private readonly fb = inject(FormBuilder);
  private readonly editingCategoryId = signal<number | null>(null);

  readonly categories = this.categoryStore.categories;
  readonly loading = this.categoryStore.loading;
  readonly error = this.categoryStore.error;
  readonly isEditing = computed(() => this.editingCategoryId() !== null);

  readonly categoryForm = this.fb.group({
    categoryName: ['', Validators.required],
  });

  constructor() {
    this.categoryStore.loadCategories();
  }

  submit() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const formValue = this.categoryForm.getRawValue();
    const payload = {
      categoryName: formValue.categoryName ?? '',
    };

    const editingId = this.editingCategoryId();

    if (editingId === null) {
      this.categoryStore.createCategory(payload);
    } else {
      this.categoryStore.updateCategory({
        categoryID: editingId,
        ...payload,
      });
    }

    this.resetForm();
  }

  editCategory(category: CategoryModel) {
    this.editingCategoryId.set(category.categoryID);
    this.categoryForm.patchValue({
      categoryName: category.categoryName,
    });
  }

  deleteCategory(id: number) {
    if (confirm('Excluir esta categoria?')) {
      this.categoryStore.deleteCategory(id);
    }
  }

  resetForm() {
    this.editingCategoryId.set(null);
    this.categoryForm.reset({
      categoryName: '',
    });
  }

  get f() {
    return this.categoryForm.controls;
  }
}
