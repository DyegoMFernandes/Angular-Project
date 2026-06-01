import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout.component/layout.component';
import { HomeComponent } from './shared/home.component/home.component';

import { OrderComponent } from './shared/order.component/order.component';
import { CategoryComponent } from './shared/category.component/category.component';
import { StockComponent } from './shared/stock.component/stock.component';
import { RegisterComponent } from './shared/auth/register.component/register.component';
import { LoginComponent } from './shared/auth/login.component/login.component';
import { ProductComponent } from './shared/product.component/product.component';
import { ShoppingcartComponent } from './shared/shoppingcart.component/shoppingcart.component';

export const routes: Routes = [
    {
        path:"",
        component: LayoutComponent,
        children:[
            {path:'home', component: HomeComponent},
            {path:'', redirectTo:'home', pathMatch:'full'},]
    },
    {
        path:"products",
        component: LayoutComponent,
        children:[
            {path:'', component: ProductComponent},]
    },
    {
        path:"categories",
        component: LayoutComponent,
        children:[
            {path:'', component: CategoryComponent},]
    },
    {
        path:"orders",
        component: LayoutComponent,
        children:[
            {path:'', component: OrderComponent},]
    },
    {
        path:"shoppingcart",
        component: LayoutComponent,
        children:[
            {path:'', component: ShoppingcartComponent},]
    },
    {
        path:"stock",
        component: LayoutComponent,
        children:[
            {path:'', component: StockComponent},]
    },
    {
        path:"register",
        component: RegisterComponent,
    },
    {
        path:"login",
        component: LoginComponent
    },
];
