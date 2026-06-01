import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingcartComponent } from './shoppingcart.component';

describe('ShoppingcartComponent', () => {
  let component: ShoppingcartComponent;
  let fixture: ComponentFixture<ShoppingcartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingcartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShoppingcartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
