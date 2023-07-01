import { Stock } from './stock';

export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
}

export interface ProductWithStock extends Product, Pick<Stock, 'count'> {}

export interface CreateProductRequestAttributes
  extends Pick<ProductWithStock, 'title' | 'description'> {
  count: string;
  price: string;
}
