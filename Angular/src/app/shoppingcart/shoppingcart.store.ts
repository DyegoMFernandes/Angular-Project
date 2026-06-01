import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ProductService } from '../product/product';
import { ProductModel } from '../product/product.model';
import { ShoppingCartModel } from './shoppingcart.model';
import { ShoppingCartService } from './shoppingcart';
import { CartItemModel } from './cartItem/cart-item.model';
import { CartItemService } from './cartItem/cart-item';

interface ShoppingCartItemView {
  cartItemID: number;
  cartID: number;
  productID: number;
  quantity: number;
  productName: string;
  description: string;
  price: number;
  lineTotal: number;
}

interface ShoppingCartState {
  cart: ShoppingCartModel | null;
  items: readonly CartItemModel[];
  products: readonly ProductModel[];
  loading: boolean;
  error: HttpErrorResponse | null;
}

const initialState: ShoppingCartState = {
  cart: null,
  items: [],
  products: [],
  loading: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class ShoppingCartStore {
  private readonly authService = inject(AuthService);
  private readonly shoppingCartService = inject(ShoppingCartService);
  private readonly cartItemService = inject(CartItemService);
  private readonly productService = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly state = signal<ShoppingCartState>(initialState);

  cart = computed(() => this.state().cart);
  items = computed(() => this.state().items);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);

  itemViews = computed<readonly ShoppingCartItemView[]>(() => {
    const productsById = new Map(this.state().products.map((product) => [product.productID, product]));

    return this.state().items.map((item) => {
      const product = productsById.get(item.productID);

      return {
        cartItemID: item.cartItemID,
        cartID: item.cartID,
        productID: item.productID,
        quantity: item.quantity,
        productName: product?.productName ?? `Produto #${item.productID}`,
        description: product?.description ?? 'Produto sem descricao carregada.',
        price: product?.price ?? 0,
        lineTotal: (product?.price ?? 0) * item.quantity,
      };
    });
  });

  totalAmount = computed(() =>
    this.itemViews().reduce((total, item) => total + item.lineTotal, 0)
  );

  loadCart() {
    if (!this.authService.isAuthenticated()) {
      this.state.set(initialState);
      return;
    }

    this.setLoading();

    this.shoppingCartService
      .getShoppingCarts()
      .pipe(
        switchMap((carts) => {
          const cart = carts[0] ?? null;
          this.state.update((state) => ({ ...state, cart }));

          return this.cartItemService.getCartItems();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (items) => {
          this.state.update((state) => ({
            ...state,
            items,
            loading: false,
            error: null,
          }));
          this.loadProductsForCart();
        },
        error: (error: HttpErrorResponse) => this.setError(error),
      });
  }

  addProductToCart(product: ProductModel, quantity = 1) {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.setLoading();

    const ensureCart$ = this.cart()
      ? this.shoppingCartService.getShoppingCarts()
      : this.shoppingCartService.createShoppingCart().pipe(
          switchMap((cart) => {
            this.state.update((state) => ({ ...state, cart }));
            return this.shoppingCartService.getShoppingCarts();
          })
        );

    ensureCart$
      .pipe(
        switchMap((carts) => {
          const activeCart = this.cart() ?? carts[0];

          if (!activeCart) {
            throw new Error('Nao foi possivel criar o carrinho do usuario.');
          }

          this.state.update((state) => ({ ...state, cart: activeCart }));

          return this.cartItemService.createCartItem(activeCart.cartID, product.productID, quantity);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.loadCart();
        },
        error: (error: HttpErrorResponse) => this.setError(error),
      });
  }

  removeCartItem(cartItemID: number) {
    this.setLoading();
    this.cartItemService
      .deleteCartItem(cartItemID)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadCart(),
        error: (error: HttpErrorResponse) => this.setError(error),
      });
  }

  updateCartItemQuantity(item: CartItemModel, quantity: number) {
    const sanitizedQuantity = Math.max(1, Math.trunc(quantity));

    this.setLoading();
    this.cartItemService
      .updateCartItem(item.cartItemID, item.cartID, item.productID, sanitizedQuantity)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadCart(),
        error: (error: HttpErrorResponse) => this.setError(error),
      });
  }

  clearCart(onSuccess?: () => void) {
    const activeCart = this.cart();
    if (!activeCart) {
      onSuccess?.();
      return;
    }

    this.setLoading();
    this.shoppingCartService
      .deleteShoppingCart(activeCart.cartID)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.state.set(initialState);
          onSuccess?.();
        },
        error: (error: HttpErrorResponse) => this.setError(error),
      });
  }

  private loadProductsForCart() {
    this.productService
      .getProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) => {
          this.state.update((state) => ({ ...state, products }));
        },
      });
  }

  private setLoading() {
    this.state.update((state) => ({ ...state, loading: true, error: null }));
  }

  private setError(error: HttpErrorResponse) {
    this.state.update((state) => ({ ...state, loading: false, error }));
  }
}
