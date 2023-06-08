import { Stock } from '../models/stock';
import { mockProducts } from './products';

export const mockStocks: Stock[] = mockProducts.map((product, index) => ({
  product_id: product.id,
  count: (index + 1) * 5,
}));
